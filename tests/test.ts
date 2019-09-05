// tslint:disable:max-line-length
import * as os from 'os';
import { resolve } from 'path';
import {
  pathExistsSync,
  removeSync, copySync,
  ensureDirSync, ensureFileSync,
  readJsonSync, writeJsonSync,
  outputFileSync,
} from 'fs-extra';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { spawnSync } from 'child_process';
import * as cfs from 'configstore';
const configstore = new cfs('sheetbase_cli');

import { getOAuth2Client } from '../src/services/google';
import { driveRemove } from '../src/services/drive';

const SHEETBASE = (os.type() === 'Windows_NT') ? 'sheetbase.cmd' : 'sheetbase';

const PROJECT_NAME = 'test_project';
const PROJECT_PATH = resolve(PROJECT_NAME);

function createTestProject() {
  spawnSync(SHEETBASE, ['start', PROJECT_NAME, '--no-setup']);
}

function removeTestProject() {
  removeSync(PROJECT_PATH);
}

const GOOGLE_RC = '.googlerc.json';
const GOOGLE_RC_BAK = '.googlerc.json.bak';

const FAKE_GOOGLE_ACCOUNTS = [];
// build fake google accounts
[1, 2, 3].forEach(i => {
  FAKE_GOOGLE_ACCOUNTS.push({
      refreshToken: Math.random().toString(36).substr(2),
      profile: {
        id: Math.random().toString(12).substr(2),
        email: `fake${i}@sheetbase.dev`,
      },
      grantedAt: (new Date()).getTime(),
    });
});

function removeGoogleRc() {
  if (pathExistsSync(GOOGLE_RC)) {
    copySync(GOOGLE_RC, GOOGLE_RC_BAK);
    removeSync(GOOGLE_RC);
  }
}

function restoreGoogleRc() {
  if (pathExistsSync(GOOGLE_RC_BAK)) {
    copySync(GOOGLE_RC_BAK, GOOGLE_RC);
    removeSync(GOOGLE_RC_BAK);
  }
}

function expectResult(args: string[], expected: string, cwd = '.') {
  const result = spawnSync(
    SHEETBASE, args, { cwd, encoding : 'utf8' },
  );
  expect(result.stdout).to.contain(expected);
  expect(result.status).to.equal(0);
}

function expectError(args: string[], expected: string, cwd = '.') {
  const result = spawnSync(
    SHEETBASE, args, { cwd, encoding : 'utf8' },
  );
  expect(result.stderr).to.contain(expected);
  // expect(result.status).to.equal(1);
}

describe('Test GOOGLE command', () => {

  beforeEach(() => {
    removeGoogleRc();
    // need at least an account connected
    const { id } = FAKE_GOOGLE_ACCOUNTS[0].profile;
    FAKE_GOOGLE_ACCOUNTS.forEach(account => {
      const { id } = account.profile;
      configstore.set(`google_accounts.${id}`, account);
    });
    configstore.set(`google_accounts_default_id`, id);
  });

  afterEach(() => {
    spawnSync(SHEETBASE, ['google', 'disconnect', 'all']);
    restoreGoogleRc();
  });

  const LISTING_EXPECTED = `${FAKE_GOOGLE_ACCOUNTS[0].profile.id} (default)`;
  const DISCONNECTION_EXPECTED = 'Accounts disconnected:';

  it('should fail to disconnect (no input arg)', () => {
    expectError(['google', 'disconnect'], 'No value provided, available: <id>|all|default|local.');
  });

  it('should fail to disconnect (invalid id)', () => {
    expectError(['google', 'disconnect', 'xxxxxxx'], 'Invalid id.');
  });

  it('should fail to disconnect local (no .googlerc.json)', () => {
    expectError(['google', 'disconnect', 'local'], 'No local account.');
  });

  it('should fail to set default (invalid id)', () => {
    expectError(['google', 'default', 'xxxxxxx'], 'Invalid id.');
  });

  // NOTE: manually test for
  it.skip('(manually) google connect (answer NO)');
  it.skip('(manually) google connect');
  it.skip('(manually) google connect --yes');
  it.skip('(manually) google connect --creds');
  it.skip('(manually) google connect --full-drive');

  it('should list', () => expectResult(['google', 'list'], LISTING_EXPECTED));

  it('should show default account', () => expectResult(['google', 'default'], LISTING_EXPECTED));

  it('should set default', () => {
    const { id } = FAKE_GOOGLE_ACCOUNTS[1].profile;
    expectResult(['google', 'default', id], `Default acccount changed to "${id}", detail: sheetbase google list -d`);
  });

  it('should disconnect by id', () => {
    expectResult(['google', 'disconnect', FAKE_GOOGLE_ACCOUNTS[2].profile.id], DISCONNECTION_EXPECTED);
  });

  it('should disconnect default', () => {
    expectResult(['google', 'disconnect', 'default'], DISCONNECTION_EXPECTED);
  });

  it('should disconnect all', () => {
    expectResult(['google', 'disconnect', 'all'], DISCONNECTION_EXPECTED);
  });

  it('should disconnect local', () => {
    writeJsonSync(GOOGLE_RC, FAKE_GOOGLE_ACCOUNTS[0]); // create fake for removing
    expectResult(['google', 'disconnect', 'local'], DISCONNECTION_EXPECTED);
  });

  it('should list (account from .googlerc.json)', () => {
    restoreGoogleRc();
    expectResult(['google', 'list'], `(local)`);
  });

});

describe('Test START command', () => {

  beforeEach(() => removeTestProject());
  afterEach(() => removeTestProject());

  it('should fail (project exists)', () => {
    ensureDirSync(PROJECT_NAME);
    expectError(['start', PROJECT_NAME], 'Project exists, please choose different name.');
  });

  it('should fail (invalid theme, cannot download or extract file)', () => {
    expectError(['start', PROJECT_NAME, 'invalid-theme@1.0.0'], 'Error: Request failed with status code 404');
  });

  it('should start a theme project', () => {
    // add --no-setup for ignore no google accounts
    expectResult(['start', PROJECT_NAME, '--no-setup'], 'Sheetbase theme project created');
  });

  it('should start a theme project (specific theme)', () => {
    expectResult(['start', PROJECT_NAME, 'basic-angular', '--no-setup'], 'github.com/sheetbase-themes/basic-angular');
  });

  it('should start a theme project (correct milestones)', () => {
    const result = spawnSync(
      SHEETBASE, ['start', PROJECT_NAME, '--no-setup'], { cwd: '.', encoding : 'utf8' },
    );
    expect(result.stdout).to.contain('Get the resource:');
    expect(result.stdout).to.contain('Initial config the project');
  });

  it('should start a new project (not theme)', () => {
    expectResult(['start', PROJECT_NAME, 'https://github.com/sheetbase/blank-server-module.git'], 'Sheetbase project created');
  });

});

describe('Test SETUP command', () => {

  beforeEach(() => {
    // create a new project
    createTestProject();
    // copy .googlerc.json (connect the tester account)
    copySync(GOOGLE_RC, PROJECT_PATH + '/' + GOOGLE_RC);
  });

  afterEach(async () => {
    const { projectId } = readJsonSync(`${PROJECT_PATH}/sheetbase.json`);
    // remove drive folder
    await driveRemove(await getOAuth2Client(), projectId);
    // remove test project
    removeTestProject();
  });

  it('should setup the project', () => expectResult(['setup'], 'Project setup successfully.', PROJECT_PATH));

  it('should setup the project with correct milestones', () => {
    const result = spawnSync(
      SHEETBASE, ['setup'], { cwd: PROJECT_PATH, encoding : 'utf8' },
    );
    expect(result.stdout).to.contain('Create drive folder');
    expect(result.stdout).to.contain('Create backend script');
    expect(result.stdout).to.contain('Initial deploy the backend');
  });

});

describe('Test CONFIG(S) command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should list configs', () => {
    expectResult(['configs'], 'Project configs listed, to update: sheetbase config update key=value|...', PROJECT_NAME);
  });

  it('should list configs (default for: list)', () => {
    expectResult(['config'], 'Project configs listed, to update: sheetbase config update key=value|...', PROJECT_NAME);
  });

  it('should list configs', () => {
    expectResult(['config', 'list'], 'Project configs listed, to update: sheetbase config update key=value|...', PROJECT_NAME);
  });

  it('should list configs (may not have configs, has backend)', () => {
    writeJsonSync(PROJECT_PATH + '/sheetbase.json', {
      configs: { backend: { xxx: 'xxxxxxx' } },
    });
    expectResult(['configs'], 'Backend configurations:', PROJECT_NAME);
  });

  it('should update configs (no value arg)', () => {
    expectResult(['config', 'update'], 'Project configs updated, view: sheetbase configs', PROJECT_NAME);
  });

  it('should set configs', () => {
    expectResult(['config', 'update', 'xxx=xxx_value'], 'Project configs updated, view: sheetbase configs', PROJECT_NAME);
  });

  it('should fail to import (no or invalid file)', () => {
    expectError(['config', 'import'], 'No configs file found.', PROJECT_NAME);
  });

  it('should import configs', () => {
    writeJsonSync(PROJECT_PATH + '/configs-file.json', {
      backend: {}, frontend: {},
    });
    expectResult(['config', 'import', 'configs-file.json'], 'Project configs imported, view: sheetbase configs', PROJECT_NAME);
  });

  it('should export configs', () => {
    expectResult(['config', 'export'], 'Project configs exported to "exported/sheetbase-configs-exported-', PROJECT_NAME);
  });

  it('should export configs (custom path)', () => {
    const FILE = 'my-project-config.json';
    expectResult(['config', 'export', FILE], `Project configs exported to "${FILE}".`, PROJECT_NAME);
  });

});

describe('Test URL(S) command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should show urls list', () => {
    expectResult(['urls'], 'Links listed, to open a link: sheetbase url -o <name>', PROJECT_NAME);
  });

  it('should show url', () => {
    expectResult(['url'], 'Link of [drive]:', PROJECT_NAME);
  });

  it('should open link in browser', () => {
    expectResult(['url', '-o'], 'Link opened:', PROJECT_NAME);
  });

  it('should show url (by name)', () => {
    expectResult(['url', 'backend'], 'Link of [backend]:', PROJECT_NAME);
  });

});

describe('Test MODEL(S) command', () => {

  beforeEach(() => {
    createTestProject();
    // copy .googlerc.json (connect the tester account)
    copySync(GOOGLE_RC, PROJECT_PATH + '/' + GOOGLE_RC);
  });
  afterEach(() => removeTestProject());

  it('should show message (no models)', () => {
    expectResult(['models'], 'The project has no models, to create a model: sheetbase model <schemaFile>', PROJECT_NAME);
  });

  it('should show list models', () => {
    ensureDirSync(PROJECT_PATH + '/models'); // create models folder
    // a model schema named test
    writeJsonSync(PROJECT_PATH + '/models/test.json', [
      { name: '#' }, { name: 'title' },
    ]);
    expectResult(['models'], 'Models listed, to create a model: sheetbase model <schemaFile>', PROJECT_NAME);
  });

  it('should error for model (no databaseId)', () => {
    expectError(['model'], 'No database found or invalid.', PROJECT_NAME);
  });

  it('should show ok message', () => {
    // has databaseId (from args), but no model to create
    expectResult(['model', '--database', 'xxx'], 'Models created.', PROJECT_NAME);
  });

  it('should show delete Sheet1', () => {
    expectResult(['model', '--clean', '--database', 'xxx'], 'Remove "Sheet1"', PROJECT_NAME);
  });

  it('should show create models', () => {
    ensureDirSync(PROJECT_PATH + '/models'); // create models folder
    // a model schema named test
    writeJsonSync(PROJECT_PATH + '/models/test.json', [
      { name: '#' }, { name: 'title' },
    ]);
    expectResult(['model', '--database', 'xxx'], 'Create model "test"', PROJECT_NAME);
  });

});

describe('Test INFO command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should show project info', () => expectResult(['info'], 'A Sheetbase project', PROJECT_NAME));

});

describe('Test BACKEND command', () => {

  beforeEach(() => {
    ensureDirSync('./backend'); // create backend folder
    // to have 'xxx' script
    writeJsonSync('./backend/package.json', {
      scripts: { xxx: 'echo "Run script xxx"' },
    });
    // to have scriptId
    writeJsonSync('./backend/.clasp.json', { scriptId: 'xxx' });
    // to have a file for push
    outputFileSync('./backend/deploy/index.js', '// ...');
    // to be a valid project
    writeJsonSync('./sheetbase.json', {
      configs: {
        frontend: {
          backendUrl: 'https://script.google.com/macros/s/xxx/exec',
        },
      },
    });
  });

  afterEach(() => {
    removeSync('./backend');
    removeSync('./sheetbase.json');
  });

  it('should error for push (no scriptId)', () => {
    writeJsonSync('./backend/.clasp.json', { scriptId: '' });
    expectError(['backend', 'push'], `No backend found or invalid.`);
  });

  it('should error for push (no deploy folder)', () => {
    expectError(['backend', 'push'], `Project contents must include a manifest file named appsscript.`);
  });

  it('should run push', () => {
    writeJsonSync('./backend/deploy/appsscript.json', {}); // must have appsscript.json
    // invalid scriptId = 'xxx'
    expectError(['backend', 'push'], `Request contains an invalid argument.`);
  });

  it('should error for deploy (no scriptId)', () => {
    writeJsonSync('./backend/.clasp.json', { scriptId: '' });
    expectError(['backend', 'deploy'], `No backend found or invalid.`);
  });

  it('should error for deploy (no deploy folder)', () => {
    expectError(['backend', 'deploy'], `Project contents must include a manifest file named appsscript.`);
  });

  it('should error for deploy (no backendUrl aka deploymentId)', () => {
    writeJsonSync('./sheetbase.json', {});
    expectError(['backend', 'deploy'], `No backend found or invalid.`);
  });

  it('should run deploy', () => {
    writeJsonSync('./backend/deploy/appsscript.json', {}); // must have appsscript.json
    // invalid scriptId = 'xxx' and deploymentId = xxx
    expectError(['backend', 'deploy'], `Request contains an invalid argument.`);
  });

  it('should run install', () => {
    expectResult(['backend', 'install'], `up to date`);
  });

  it('should run uninstall', () => {
    expectResult(['backend', 'uninstall'], `up to date`);
  });

  it('should run run', () => {
    expectResult(['backend', 'run', 'xxx'], `Run script xxx`);
  });

  it('should run abc command', () => {
    expectError(['backend', 'abc'], `'abc.cmd' is not recognized as an internal or external command`);
  });

  it('should run script', () => {
    expectResult(['backend', 'xxx'], `Run script xxx`);
  });

});

describe('Test FRONTEND command', () => {

  beforeEach(() => {
    ensureDirSync('./frontend'); // create frontend folder
    // to have 'xxx' script
    writeJsonSync('./frontend/package.json', {
      scripts: { xxx: 'echo "Run script xxx"' },
    });
  });

  afterEach(() => {
    removeSync('./frontend');
  });

  it('should run install', () => {
    expectResult(['frontend', 'install'], `up to date`);
  });

  it('should run uninstall', () => {
    expectResult(['frontend', 'uninstall'], `up to date`);
  });

  it('should run run', () => {
    expectResult(['frontend', 'run', 'xxx'], `Run script xxx`);
  });

  it('should run abc command', () => {
    expectError(['frontend', 'abc'], `'abc.cmd' is not recognized as an internal or external command`);
  });

  it('should run script', () => {
    expectResult(['frontend', 'xxx'], `Run script xxx`);
  });

});

describe('Test DOCS command', () => {
  it('should open docs', () => expectResult(['docs'], 'Link opened: https://sheetbase.dev/docs'));
});

describe('Test UPDATE command', () => {
  it.skip('should be up to date', () => expectResult(['update'], 'Up to date :)'));
  it.skip('should have update', () => expectResult(['update'], 'Sheetbase CLI got a new version, please update:'));
});

describe('Test HELP command', () => {
  it('should show help', () => expectResult(['help'], 'Global commands:'));
  it('should show detail help', () => expectResult(['help', '--detail'], 'Command groups:'));
});

describe('Test * commands', () => {
  it('should run script unknown', () => {
    expectError(['unknown'], `npm ERR! missing script: unknown`);
  });
});

describe('Test command group when missing subcommands', () => {
  it('should show google subcommands', () => {
    expectResult(['google'], 'Invalid sub-command for "google", available:');
  });
  it('should show project subcommands', () => {
    expectResult(['project'], 'Invalid sub-command for "project", available:');
  });
});

describe('Test project specific commands while not in a Sheetbase project', () => {
  const EXPECTED = 'Invalid project, no "sheetbase.json" found.';
  it('should fail for setup', () => expectError(['setup'], EXPECTED));
  it('should fail for configs', () => expectError(['configs'], EXPECTED));
  it('should fail for config', () => expectError(['config'], EXPECTED));
  it('should fail for urls', () => expectError(['urls'], EXPECTED));
  it('should fail for url', () => expectError(['url'], EXPECTED));
  it('should fail for models', () => expectError(['models'], EXPECTED));
  it('should fail for model', () => expectError(['model'], EXPECTED));
  it('should fail for info', () => expectError(['info'], EXPECTED));
});

describe('Test commands while no Google account', () => {

  beforeEach(() => {
    removeGoogleRc();
    spawnSync(SHEETBASE, ['google', 'disconnect', 'all']);
  });
  afterEach(() => restoreGoogleRc());

  const EXPECTED = 'No Google accounts connected, to connect: sheetbase google connect and try again.';

  it('should fail for: setup', () => {
    ensureFileSync('sheetbase.json'); // for valid project
    expectError(['setup'], EXPECTED);
    removeSync('sheetbase.json');
  });

  it('should fail for: model', () => {
    ensureFileSync('sheetbase.json'); // for valid project
    expectError(['model'], EXPECTED);
    removeSync('sheetbase.json');
  });

  it('should fail for: google list', () => {
    expectError(['google', 'list'], EXPECTED);
  });

  it('should fail for: backend push', () => {
    expectError(['backend', 'push'], EXPECTED);
  });

  it('should fail for: backend deploy', () => {
    expectError(['backend', 'deploy'], EXPECTED);
  });

});

describe('Test --help for each command', () => {
  it('should google --help', () => expectResult(['google', '-h'], 'Manage Google accounts.'));
  it('should project --help', () => expectResult(['project', '-h'], 'Project general tasks.'));

  it('should start --help', () => expectResult(['start', '-h'], 'Start a new project.'));
  it('should setup --help', () => expectResult(['setup', '-h'], 'Setup the project.'));
  it('should configs --help', () => expectResult(['configs', '-h'], 'View project configs.'));
  it('should config --help', () => expectResult(['config', '-h'], 'Config the project.'));
  it('should urls --help', () => expectResult(['urls', '-h'], 'View project URLs.'));
  it('should url --help', () => expectResult(['url', '-h'], 'View or open a project URL.'));
  it('should models --help', () => expectResult(['models', '-h'], 'View project models.'));
  it('should model --help', () => expectResult(['model', '-h'], 'Create database models.'));
  it('should info --help', () => expectResult(['info', '-h'], 'Output project info.'));
  it('should backend --help', () => expectResult(['backend', '-h'], 'Run backend related commands.'));
  it('should frontend --help', () => expectResult(['frontend', '-h'], 'Run frontend related commands.'));

  it('should docs --help', () => expectResult(['docs', '-h'], 'Open the documentation.'));
  it('should update --help', () => expectResult(['update', '-h'], 'Check and install update.'));
  it('should help --help', () => expectResult(['help', '-h'], 'Display help.'));
});

describe('Test variations of sheetbase help', () => {
  const EXPECTED = `Usage: sheetbase <command> [<args>] [--help] [options]`;
  it('should show help for sheetbase help', () => expectResult(['help'], EXPECTED));
  it('should show help for sheetbase --help', () => expectResult(['--help'], EXPECTED));
  it('should show help for sheetbase -h', () => expectResult(['-h'], EXPECTED));
});

describe('Test variations of sheetbase --version', () => {
  const EXPECTED = require('./../package.json').version;
  it('should show version for sheetbase --version', () => expectResult(['--version'], EXPECTED));
  it('should show version for sheetbase -v', () => expectResult(['-v'], EXPECTED));
});
