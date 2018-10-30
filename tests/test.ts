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

import { getOAuth2Client } from '../src/services/google/google.service';
import { driveRemove } from '../src/services/drive/drive.service';

const SHEETBASE = (os.type() === 'Windows_NT') ? 'sheetbase.cmd' : 'sheetbase';

const PROJECT_NAME = 'test_project';

const PROJECT_PATH = resolve(PROJECT_NAME);

const FAKE_GOOGLE_ACCOUNTS = [];
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

const GOOGLE_RC = '.googlerc.json';
const GOOGLE_RC_BAK = '.googlerc.json.bak';

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
  expect(result.status).to.equal(0);
  expect(result.stdout).to.contain(expected);
}

function expectError(args: string[], expected: string, cwd = '.') {
  const result = spawnSync(
    SHEETBASE, args, { cwd, encoding : 'utf8' },
  );
  expect(result.stderr).to.contain(expected);
  expect(result.status).to.equal(1);
}

describe('Test --help for each command', () => {
  it('should account --help', () => expectResult(['account', '-h'], 'Manage Sheetbase account.'));
  it('should login --help', () => expectResult(['login', '-h'], 'Login to Sheetbase Cloud account.'));
  it('should logout --help', () => expectResult(['logout', '-h'], 'Logout of your Sheetbase Cloud account.'));
  it('should signup --help', () => expectResult(['signup', '-h'], 'Create a Sheetbase Cloud account.'));
  it('should profile --help', () => expectResult(['profile', '-h'], 'Manage Sheetbase account profile.'));
  it('should google --help', () => expectResult(['google', '-h'], 'Manage Google accounts.'));
  it('should project --help', () => expectResult(['project', '-h'], 'Project general tasks.'));
  it('should start --help', () => expectResult(['start', '-h'], 'Start a new project.'));
  it('should setup --help', () => expectResult(['setup', '-h'], 'Setup the project.'));
  it('should config --help', () => expectResult(['config', '-h'], 'Config backend & frontend.'));
  it('should urls --help', () => expectResult(['urls', '-h'], 'View project URLs.'));
  it('should info --help', () => expectResult(['info', '-h'], 'Output project info.'));
  it('should hooks --help', () => expectResult(['hooks', '-h'], 'Output list of hooks.'));
  it('should docs --help', () => expectResult(['docs', '-h'], 'Open the documentation.'));
  it('should help --help', () => expectResult(['help', '-h'], 'Display help.'));
});

describe('Test command group when missing subcommands', () => {
  it('should show account subcommands', () => expectResult(['account'], 'Account subcommands:'));
  it('should show google subcommands', () => expectResult(['google'], 'Google subcommands:'));
  it('should show project subcommands', () => expectResult(['project'], 'Project subcommands:'));
});

describe('Test ACCOUNT command', () => {
  before(() => {
    // log user in
    const sheetbaseRc = readJsonSync('.sheetbaserc.json');
    configstore.set('user_credentials', sheetbaseRc);
  });

  it('should fail to login (already)', () => {
    // add --web workaround for now, or inquirer will give no stderr
    expectError(['login', '--web'], '\n [ERROR] You have logged in already!');
  });
  it('should fail to update profile (no values)', () => {
    expectError(['profile', 'update'], '\n [ERROR] No profile value argument.');
  });

  it.skip('(manually) login (wrong credentials)');
  it.skip('(manually) login');
  it.skip('(manually) login --web');
  it.skip('(manually) register (wrong credentials)');
  it.skip('(manually) register');

  it('should show upgrade instruction', () => {
    expectResult(['account', 'upgrade'], 'https://cloud.sheetbase.net');
  });
  it('should get profile', () => {
    expectResult(['profile', 'get'], 'My profile:');
  });
  it('should open profile', () => {
    expectResult(['profile', 'open'], 'https://cloud.sheetbase.net');
  });
  it('should update profile', () => {
    expectResult(
      ['profile', 'update', 'pin=1111'],
      'Profile updated!',
    );
  });
  it('should logged out', () => expectResult(['logout'], 'You logged out!'));
});

describe('Test GOOGLE command', () => {
  before(() => {
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
  const DISCONNECTION_EXPECTED = 'Google account disconnected!';

  it('should fail to disconnect (no id argument)', () => {
    expectError(['google', 'disconnect'], '\n [ERROR] No account <id>|default|all|local.');
  });
  it('should fail to disconnect (invalid id)', () => {
    expectError(['google', 'disconnect', 'xxxxxxx'], '\n [ERROR] Google disconnect fails');
  });
  it('should fail to disconnect local (no .googlerc.json)', () => {
    expectError(['google', 'disconnect', 'local'], '\n [ERROR] Google disconnect fails');
  });
  it('should fail to set default (invalid id)', () => {
    expectError(['google', 'default', 'xxxxxxx'], '\n [ERROR] Errors updating default account');
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
    expectResult(['google', 'default', id], `Default account set to: ${id}.`);
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
  beforeEach(() => {
    removeSync(PROJECT_PATH);
  });
  after(() => {
    removeSync(PROJECT_PATH);
  });

  const EXPECTED = '\n New project created under "test_project".';

  it('should fail (project exists)', () => {
    ensureDirSync(PROJECT_NAME);
    expectError(['start', PROJECT_NAME], '\n [ERROR] Project exists, try different name.');
  });
  it('should fail (invalid theme string)',() => {
    expectError(['start', PROJECT_NAME, 'invalid-theme'], '\n [ERROR] Invalid theme argument.');
  });
  it('should fail (invalid theme, cannot download or extract file)', () => {
    expectError(['start', PROJECT_NAME, 'invalid-theme@1.0.0'], '\n [ERROR] Create project failed.');
  });

  // NOTES:
  // --no-npm to reduce execution time
  // --no-setup to test later at it own suite
  it('should start a new project', () => {
    expectResult(['start', PROJECT_NAME, '--no-npm', '--no-setup'], EXPECTED);
  });
  it('should start a new project with specific theme', () => {
    expectResult(['start', PROJECT_NAME, 'basic-angular', '--no-npm', '--no-setup'], EXPECTED);
    const { name } = readJsonSync(`${PROJECT_PATH}/package.json`);
    expect(name).to.equal('basic-angular');
  });
});

describe('Test SETUP command', () => {
  before(() => {
    // create a new project
    spawnSync(SHEETBASE, ['start', PROJECT_NAME, '--no-npm', '--no-setup']);
    // reset drive folder
    // for not accidentally remove in "after all" hook
    const path = `${PROJECT_PATH}/sheetbase.json`;
    const sheetbaseJson = readJsonSync(path);
    sheetbaseJson.driveFolder = '';
    writeJsonSync(path, sheetbaseJson);
    // copy .googlerc.json (connect the tester account)
    copySync(GOOGLE_RC, PROJECT_PATH + '/' + GOOGLE_RC);
  });

  after(async () => {
    const { driveFolder } = readJsonSync(`${PROJECT_PATH}/sheetbase.json`);
    // remove test folder
    removeSync(PROJECT_PATH);
    // remove drive folder
    const googleClient = await getOAuth2Client();
    await driveRemove(googleClient, driveFolder);
  });

  const EXPECTED = 'https://script.google.com/';

  it('should setup the project', () => expectResult(['setup'], EXPECTED, PROJECT_PATH));
  it('should setup (with --trusted)', () => expectResult(['setup', '--trusted'], EXPECTED, PROJECT_PATH));
});

describe('Test CONFIG command', () => {
  before(() => {
    // create a new project
    spawnSync(SHEETBASE, ['start', PROJECT_NAME, '--no-npm', '--no-setup']);
  });
  after(() => {
    removeSync(PROJECT_PATH);
  });

  it('should fail to update (no value argument)', () => {
    expectError(['config', 'update'], '\n [ERROR] No configs value argument.', PROJECT_NAME);
  });
  it('should fail to import (no or invalid file)', () => {
    expectError(['config', 'import'], '\n [ERROR] No config file.', PROJECT_NAME);
  });

  it('should list configs (default)', () => expectResult(['config'], 'Frontend configs:', PROJECT_NAME));
  it('should list configs', () => expectResult(['config', 'list'], 'Frontend configs:', PROJECT_NAME));
  it('should update configs', () => {
    expectResult(['config', 'update', 'a_key=a_value'], 'Configs updated!', PROJECT_NAME);
  });
  it('should list configs (has backend)', () => {
    expectResult(['config'], 'Backend configs:', PROJECT_NAME);
  });
  it('should export configs', () => {
    expectResult(['config', 'export'], 'Configs exported to: exported/configs-exported-', PROJECT_NAME);
  });
  it('should export configs (custom path)', () => {
    const FILE = 'my-project-config.json';
    expectResult(['config', 'export', FILE], 'Configs exported to: ' + FILE, PROJECT_NAME);
  });
});

describe('Test URLS command', () => {
  before(() => {
    // create a new project
    spawnSync(SHEETBASE, ['start', PROJECT_NAME, '--no-npm', '--no-setup']);
  });
  after(() => {
    removeSync(PROJECT_PATH);
  });
  it('should show urls list (default)', () => {
    expectResult(['urls'], 'Project urls:', PROJECT_NAME);
  });
  it('should show urls list', () => {
    expectResult(['urls', 'list'], 'https://drive.google.com/drive/folders/', PROJECT_NAME);
  });
  it('should open link in browser', () => {
    expectResult(['urls', 'open'], 'Link opened in browser:', PROJECT_NAME);
  });
  it('should open link in browser (by name)', () => {
    expectResult(['urls', 'open', 'script'], 'https://script.google.com/', PROJECT_NAME);
  });
});

describe('Test INFO command', () => {
  before(() => {
    // create a new project
    spawnSync(SHEETBASE, ['start', PROJECT_NAME, '--no-npm', '--no-setup']);
  });
  after(() => {
    removeSync(PROJECT_PATH);
  });
  it('should show project info', () => expectResult(['info'], 'Project information:', PROJECT_NAME));
});

describe('Test HOOKS command', () => {
  before(() => {
    writeJsonSync('sheetbase.json', {});
  });
  after(() => {
    removeSync('./hooks');
    removeSync('sheetbase.json');
  });
  it('should show no hooks', () => {
    expectResult(['hooks'], 'No hooks.');
  });
  it('should show hooks list', () => {
    outputFileSync('./hooks/index.js', `
      module.exports = { config: () => true, setup: () => true };
    `);
    expectResult(['hooks'], 'Project hooks:');
  });
});

describe('Test DOCS command', () => {
  it('should open docs', () => expectResult(['docs'], 'https://sheetbase.net/docs'));
});

describe('Test HELP command', () => {
  it('should show help', () => expectResult(['help'], 'Global commands:'));
  it('should show detail help', () => expectResult(['help', '--detail'], 'Command groups:'));
});

describe('Test project specific commands while not in a Sheetbase project', () => {
  const EXPECTED = '\n [ERROR] Not in a Sheetbase project.';
  it('should fail for setup', () => expectError(['setup'], EXPECTED));
  it('should fail for config', () => expectError(['config'], EXPECTED));
  it('should fail for info', () => expectError(['info'], EXPECTED));
  it('should fail for urls', () => expectError(['urls'], EXPECTED));
  it('should fail for hooks', () => expectError(['hooks'], EXPECTED));
});

describe('Test commands while logged out', () => {
  // logout of Sheetbase
  before(() => {
    spawnSync(SHEETBASE, ['logout']);
  });
  const EXPECTED = '\n [ERROR] You have not logged in yet!';
  it('should fail for profile', () => expectError(['profile'], EXPECTED));
});

describe('Test commands while no Google account', () => {
  // remove all google accounts
  before(() => {
    spawnSync(SHEETBASE, ['google', 'disconnect', 'all']);
    removeGoogleRc();
  });
  after(() => {
    restoreGoogleRc();
  });
  const EXPECTED = '\n [ERROR] No account connected!';
  it('should fail for setup', () => {
    ensureFileSync('sheetbase.json'); // create fake sheetbase.json
    expectError(['setup'], EXPECTED);
    removeSync('sheetbase.json'); // remove sheetbase.json
  });
  it('should fail for google list', () => expectError(['google', 'list'], EXPECTED));
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

describe('Test unknown commands', () => {
  it('should fail (unknown command)', () => expectError(['unknown'], `Unknown command`));
});