import * as os from 'os';
import { resolve } from 'path';
import {
  pathExistsSync,
  removeSync, copySync,
  ensureDirSync, ensureFileSync,
  readJsonSync, writeJsonSync,
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
  spawnSync(SHEETBASE, ['start', PROJECT_NAME]);
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
        email: `fake${i}@sheetbase.net`,
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

describe('Test command group when missing subcommands', () => {
  it('should show google subcommands', () => {
    expectResult(['google'], 'APP__INFO__INVALID_SUBCOMMAND');
  });
  it('should show project subcommands', () => {
    expectResult(['project'], 'APP__INFO__INVALID_SUBCOMMAND');
  });
});

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

  const LISTING_EXPECTED = `${FAKE_GOOGLE_ACCOUNTS[0].profile.id} (default)`;
  const DISCONNECTION_EXPECTED = 'GOOGLE_DISCONNECTED__OK';

  it('should fail to disconnect (no id argument)', () => {
    expectError(['google', 'disconnect'], 'GOOGLE_DISCONNECTED__ERROR__NO_ID');
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
    expectResult(['google', 'default', id], `GOOGLE_DEFAULT__OK`);
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

  afterEach(() => removeTestProject());

  const EXPECTED = 'PROJECT_START__OK__THEME';

  it('should fail (project exists)', () => {
    ensureDirSync(PROJECT_NAME);
    expectError(['start', PROJECT_NAME], 'PROJECT_START__ERROR__EXISTS');
  });

  it('should fail (invalid theme, cannot download or extract file)', () => {
    expectError(['start', PROJECT_NAME, 'invalid-theme@1.0.0'],
      'Error: Request failed with status code 404',
    );
  });

  it('should start a new project', () => {
    expectResult(['start', PROJECT_NAME], EXPECTED);
  });

  it('should start a new project with specific theme', () => {
    expectResult(['start', PROJECT_NAME, 'basic-angular'], 'github.com/sheetbase-themes/basic-angular');
  });

  it('should start a new project with correct milestones', () => {
    const result = spawnSync(
      SHEETBASE, ['start', PROJECT_NAME], { cwd: '.', encoding : 'utf8' },
    );
    expect(result.stdout).to.contain('Get the resource:');
    expect(result.stdout).to.contain('Initial config the project');
  });

});

describe.skip('Test SETUP command', () => {

  beforeEach(() => {
    // create a new project
    createTestProject();
    // copy .googlerc.json (connect the tester account)
    copySync(GOOGLE_RC, PROJECT_PATH + '/' + GOOGLE_RC);
  });

  afterEach(async () => {
    const { driveFolder } = readJsonSync(`${PROJECT_PATH}/sheetbase.json`);
    // remove test project
    removeTestProject();
    // remove drive folder
    await driveRemove(await getOAuth2Client(), driveFolder);
  });

  const EXPECTED = 'PROJECT_SETUP__OK';

  it('should setup the project', () => expectResult(['setup'], EXPECTED, PROJECT_PATH));

  it('should setup the project with correct milestones', () => {
    const result = spawnSync(
      SHEETBASE, ['setup'], { cwd: PROJECT_PATH, encoding : 'utf8' },
    );
    expect(result.stdout).to.contain('Create drive folder');
    expect(result.stdout).to.contain('Create backend script');
    expect(result.stdout).to.contain('Initial deploy the backend');
  });

});

describe('Test CONFIG command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should fail to import (no or invalid file)', () => {
    expectError(['config', 'import'], 'PROJECT_CONFIG_IMPORT__ERROR__NO_FILE', PROJECT_NAME);
  });

  it('should list configs (default)', () => {
    expectResult(['config'], 'PROJECT_CONFIG_LIST__OK', PROJECT_NAME);
  });

  it('should list configs', () => {
    expectResult(['config', 'list'], 'PROJECT_CONFIG_LIST__OK', PROJECT_NAME);
  });

  it('should update configs (no value argument)', () => {
    expectResult(['config', 'update'], 'PROJECT_CONFIG_UPDATE__OK', PROJECT_NAME);
  });

  it('should set configs', () => {
    expectResult(['config', 'update', 'a_key=a_value'], 'PROJECT_CONFIG_UPDATE__OK', PROJECT_NAME);
  });

  it('should list configs (has backend)', () => {
    expectResult(['config'], 'Backend configs:', PROJECT_NAME);
  });

  it('should export configs', () => {
    expectResult(['config', 'export'], 'PROJECT_CONFIG_EXPORT__OK', PROJECT_NAME);
  });

  it('should export configs (custom path)', () => {
    const FILE = 'my-project-config.json';
    expectResult(['config', 'export', FILE], 'PROJECT_CONFIG_EXPORT__OK', PROJECT_NAME);
  });

});

describe('Test URLS command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should show urls list (default)', () => {
    expectResult(['urls'], 'PROJECT_URLS_LIST__OK', PROJECT_NAME);
  });

  it('should show urls list', () => {
    expectResult(['urls', 'list'], 'PROJECT_URLS_LIST__OK', PROJECT_NAME);
  });

  it('should open link in browser', () => {
    expectResult(['urls', 'open'], 'APP_INFO_LINK_OPENED', PROJECT_NAME);
  });

  it('should open link in browser (by name)', () => {
    expectResult(['urls', 'open', 'backend'], 'APP_INFO_LINK_OPENED', PROJECT_NAME);
  });

});

describe('Test INFO command', () => {

  beforeEach(() => createTestProject());
  afterEach(() => removeTestProject());

  it('should show project info', () => expectResult(['info'], 'A Sheetbase project', PROJECT_NAME));

});

describe('Test DOCS command', () => {
  it('should open docs', () => expectResult(['docs'], 'APP__INFO__LINK_OPENED'));
});

describe('Test BACKEND command', () => {
  it('should run backend cmd', () => expectError(['backend'], `Error: spawnSync`));
});

describe('Test FRONTEND command', () => {
  it('should run frontend cmd', () => expectError(['frontend'], `Error: spawnSync`));
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

describe('Test project specific commands while not in a Sheetbase project', () => {
  const EXPECTED = 'PROJECT__ERROR__INVALID';
  it('should fail for setup', () => expectError(['setup'], EXPECTED));
  it('should fail for config', () => expectError(['config'], EXPECTED));
  it('should fail for info', () => expectError(['info'], EXPECTED));
  it('should fail for urls', () => expectError(['urls'], EXPECTED));
});

describe('Test commands while no Google account', () => {

  beforeEach(() => {
    spawnSync(SHEETBASE, ['google', 'disconnect', 'all']);
    removeGoogleRc();
  });

  afterEach(() => restoreGoogleRc());

  it('should fail for setup', () => {
    ensureFileSync('sheetbase.json'); // create fake sheetbase.json
    expectError(['setup'], 'PROJECT_SETUP__ERROR__NO_GOOGLE_ACCOUNT');
    removeSync('sheetbase.json'); // remove sheetbase.json
  });

  it('should show no google list', () => {
    expectResult(['google', 'list'], 'GOOGLE_LIST__INFO__NO_ACCOUNT');
  });

});

describe('Test --help for each command', () => {
  it('should google --help', () => expectResult(['google', '-h'], 'Manage Google accounts.'));
  it('should project --help', () => expectResult(['project', '-h'], 'Project general tasks.'));
  it('should start --help', () => expectResult(['start', '-h'], 'Start a new project.'));
  it('should setup --help', () => expectResult(['setup', '-h'], 'Setup the project.'));
  it('should config --help', () => expectResult(['config', '-h'], 'Config backend & frontend.'));
  it('should urls --help', () => expectResult(['urls', '-h'], 'View project URLs.'));
  it('should info --help', () => expectResult(['info', '-h'], 'Output project info.'));
  it('should docs --help', () => expectResult(['docs', '-h'], 'Open the documentation.'));
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
