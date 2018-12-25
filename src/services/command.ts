import * as os from 'os';
import { promisify } from 'util';
import { exec as cpExec } from 'child_process';

export const execAsync = promisify(cpExec);

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

export async function exec(command: string, cwd = '.', stdio = 'inherit') {
    const [ cmd, ... cmds ] = command.trim().split(' ');
    const finalCommand = getCommand(cmd) + ' ' + cmds.join(' ');
    // return await execAsync(finalCommand, { cwd, stdio } as any);
    console.log(cwd, '"' + finalCommand + '"');
}

export async function run(
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
