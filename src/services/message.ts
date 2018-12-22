import chalk from 'chalk';

export const green = chalk.green;
export const red = chalk.red;
export const yellow = chalk.yellow;
export const magenta = chalk.magenta;
export const blue = chalk.blue;
export const gray = chalk.gray;

export const ok = `[${green('OK')}]`;
export const error = `[${red('ERROR')}]`;
export const warn = `[${yellow('WARNING')}]`;
export const wait = `[${magenta('WAIT')}]`;
export const info = `[${blue('INFO')}]`;

export function log(type: string, code: string, exit = false, args: any[] = []): void {
    let message: string = code;
    // get the message
    let msg: any;
    if (type === 'error') {
        msg = ERRORS[code];
    } else {
        msg = LOGS[code];
    }
    if (!!msg) {
        if (msg instanceof Function) {
            message = msg(... args);
        } else {
            message = msg;
        }
    }
    // log the message out
    if (type === 'error') {
        console.error(`\n ${error} ${message}`);
        return process.exit(1);
    } else if (type === 'warn') {
        console.log(`\n ${warn} ${message}`);
    } else if (type === 'wait') {
        console.log(`\n ${wait} ${message}`);
    } else if (type === 'info') {
        console.log(`\n ${info} ${message}`);
    } else {
        console.log(`\n ${ok} ${message}`);
    }
    // exit = 0
    if (!!exit) {
        return process.exit();
    }
}
export function logOk(code: string, exit = false, args?: any[]): void {
    log('ok', code, exit, args);
}
export function logError(code: string, exit = false, args?: any[]): void {
    log('error', code, exit, args);
}
export function logWarn(code: string, exit = false, args?: any[]): void {
    log('warn', code, exit, args);
}
export function logWait(code: string, exit = false, args?: any[]): void {
    log('wait', code, exit, args);
}
export function logInfo(code: string, exit = false, args?: any[]): void {
    log('info', code, exit, args);
}

export async function logAction(
    description: string,
    action: {(): Promise<any>},
    done?: string | {(result: any): string},
) {
    console.log('\n - ' + description);

    // run the action
    const timeBegin = (new Date()).getTime();
    const result = await action();
    const spent = (new Date()).getTime() - timeBegin;

    // log done
    if (!done) {
        done = '... ' + green('done');
    } else if (done instanceof Function) {
        done = done(result);
    }
    console.log('   ' + done + ' ' + gray('(' + spent + 'ms)'));
}

export const ERRORS = {};
export const LOGS = {};