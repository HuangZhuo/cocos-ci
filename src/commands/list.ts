import { CommandHandler } from '../command';

export class ListCommandHandler extends CommandHandler {
    protected description: string = '列出所有构建目标';

    async execute(action: null, options: null): Promise<boolean> {
        console.log(Object.keys(this.config.availableTargets));
        return true;
    }
}
