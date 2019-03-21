import * as os from 'os';
import { execSync } from 'child_process';

export function getCommand(command: string) {
    return (os.type() === 'Windows_NT') ? command + '.cmd' : command;
}

export function getRawArgs(
    commanderRawArgs: string[],
    command: string,
    toString = true,
) {
    const i = commanderRawArgs.indexOf(command) + 1;
    const args = commanderRawArgs.slice(i);
    if (toString) { return args.join(' '); }
    return args;
}

export function exec(command: string, cwd = '.', stdio: any = 'inherit', raw = false) {
    let finalCommand = command;
    if (!raw) {
        const [ cmd, ... cmds ] = command.trim().split(' ');
        finalCommand = getCommand(cmd) + ' ' + cmds.join(' ');
    }
    return execSync(finalCommand, { cwd, stdio });
}

export function run(
    handlerCommand: string,
    command: string,
    commanderRawArgs: string[],
    cwd = '.',
    forwarded = false,
) {
    let finalCommand: string;
    if (forwarded) {
        const args = getRawArgs(commanderRawArgs, command, false) as string[];
        if (args.length < 1) {
            throw new Error('Missing forwarded command.');
        }
        const forwardedCommand = args.shift();
        const forwardedArgs = args.join(' ');
        finalCommand = (
            handlerCommand + ` ${forwardedCommand} ` + (!!forwardedArgs ? ' -- ' + forwardedArgs : '')
        ).replace('-- --', '--');
    } else {
        finalCommand = handlerCommand + ' ' + getRawArgs(commanderRawArgs, command);
    }
    // run command
    exec(finalCommand, cwd);
}
