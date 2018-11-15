const chalk = require('chalk');
const inquirer = require('inquirer');

export function askForLogin(): Promise<any> {
    console.log('\nLogin to Sheetbase Cloud, see more at https://sheetbase.net/cloud.');
    console.log(`Not yet has an account? Create one from ` +
                `${chalk.green('https://cloud.sheetbase.net/signup')}, ` +
                `or run $ ${chalk.yellow('sheetbase signup')}`);
    console.log(`To login using different providers ` +
                `(Facebook, Google, Twitter, Github): ` +
                `$ ${chalk.yellow('sheetbase login --web')}`);
    console.log(`To grant access to your Google account only: ` +
                `$ ${chalk.yellow('sheetbase google connect')}\n`);

    const questions = [
        {
            type : 'input',
            name : 'email',
            message : 'Your email:',
        },
        {
            type : 'password',
            name : 'password',
            message : 'Your password:',
        },
    ];
    return inquirer.prompt(questions);
}

export function askForGoogleOAuth2(): Promise<any> {
    console.log('\nThe CLI need you to grant the access to your Google account, ' +
                    'so it can create assets and setup the project automatically.');
    console.log('\nIt will:');
    console.log('   + Create a folder in your Drive as the project root folder.');
    console.log('   + Create a folder, a Spreadsheet file, an Apps Script file inside.');
    console.log('   + Read, change or delete to those files and folders, associated with the project.');
    console.log('\nBeyond those, it ' + chalk.red('WILL NOT') + ':');
    console.log('   + Read, change or delete to anything else.\n');

    const questions = [
        {
            type : 'input',
            name : 'loginConfirm',
            message : 'Process now? [Y/N]:',
        },
    ];
    return inquirer.prompt(questions);
}

export function askForRegister(): Promise<any> {
    console.log('\nCreate a Sheetbase Cloud account, see more at https://sheetbase.net/cloud.');
    console.log(`Already has an account? To login, run $ ${chalk.yellow('sheetbase login')}\n`);

    const questions = [
        {
            type : 'input',
            name : 'email',
            message : 'Your email:',
        },
        {
            type : 'password',
            name : 'password',
            message : 'Your password:',
        },
        {
            type : 'password',
            name : 'passwordRepeat',
            message : 'Repeat password:',
        },
    ];
    return inquirer.prompt(questions);
}
