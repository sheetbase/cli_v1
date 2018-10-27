import { getHooks } from '../../hooks';

export async function projectHooksCommand() {
    const hooks = await getHooks();
    if (hooks && Object.keys(hooks).length > 0) {
        console.log('Project hooks:');
        for (const key of Object.keys(hooks)) {
            console.log(`+ ${key}`);
        }
    } else {
        console.log('No hooks.');
    }
    return process.exit();
}