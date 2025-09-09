import { Command } from 'commander';
import { loadConfig } from './config-helper';
import { BuildTargetConfig, CocosCIConfig, Ctor } from './types';

export function addCommand<TArgument = null, TOption = null>(
    program: Command,
    cmd: string,
    handler: Ctor<CommandHandler<TArgument, TOption>>,
) {
    return new handler(program, cmd);
}

export abstract class CommandHandler<TArgument = null, TOption = null> {
    /** cocos-ci 配置 */
    private static Config = loadConfig();

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
        this.initArgumentAndOptions?.(program);
    }

    /** 命令描述 */
    protected description: string = '';

    /** 初始化选项 */
    protected initArgumentAndOptions?(program: Command): void;

    /** 加载目标配置 */
    protected getTarget(targetName: string): BuildTargetConfig {
        const { availableTargets } = CommandHandler.Config;
        const target = availableTargets[targetName];
        if (!target) {
            throw new Error(`目标 ${targetName} 未配置`);
        }
        return target;
    }

    /** 默认目标 */
    protected get defaultTarget(): string {
        return CommandHandler.Config.defaultTarget;
    }

    /** cocos-ci 配置 */
    protected get config(): CocosCIConfig {
        return CommandHandler.Config;
    }

    /** 执行命令 */
    abstract execute(action: TArgument | TOption, options?: TOption): Promise<boolean>;
}
