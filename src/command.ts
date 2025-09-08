import { Command } from 'commander';
import { Ctor } from './types';

export function addCommand<TArgument = null, TOption = null>(
    program: Command,
    cmd: string,
    handler: Ctor<CommandHandler<TArgument, TOption>>,
) {
    return new handler(program, cmd);
}

export abstract class CommandHandler<TArgument = null, TOption = null> {
    constructor(
        protected program: Command,
        protected cmd: string,
    ) {
        program = program // for chain call
            .command(cmd)
            .description(this.description)
            .action(async (action: TArgument | TOption, options: TOption | Command) => {
                if (options instanceof Command) {
                    this.execute(<TOption>action);
                } else {
                    this.execute(action, options);
                }
            });
        this.initOptions?.(program);
    }

    /** 命令描述 */
    protected description: string = '';

    /** 初始化选项 */
    protected initOptions?(program: Command): void;

    /** 执行命令 */
    abstract execute(action: TArgument | TOption, options?: TOption): Promise<boolean>;
}
