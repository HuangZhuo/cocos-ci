import { CommandHandler } from './command';
import { loadConfig } from './common';

export class ListCommandHandler extends CommandHandler {
    protected description: string = '列出所有构建目标';

    async execute(action: null, options: null): Promise<boolean> {
        const config = loadConfig();
        console.log(Object.keys(config.availableTargets));
        return true;
    }
}
