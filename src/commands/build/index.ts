import { Command } from 'commander';
import { CommandHandler } from '../../command';
import { loadBuildConfig } from '../../config-helper';
import { getPlatformBuilder } from './builder';

type BuildCommandOptions = {
    target: string;
};

export class BuildCommandHandler extends CommandHandler<null, BuildCommandOptions> {
    protected description: string = '构建Cocos Creator项目';

    protected initArgumentAndOptions(program: Command): void {
        program.option('--target <target>', '指定构建目标');
    }

    async execute(options: BuildCommandOptions): Promise<boolean> {
        await this.build(options.target);
        return true;
    }

    /**
     * @param target 目标名称
     * @returns
     */
    private async build(target: string): Promise<void> {
        const targetConfig = this.getTarget(target);
        const { platform } = loadBuildConfig(targetConfig.configPath);
        const builder = getPlatformBuilder(this.config, platform);
        builder.run(targetConfig);
    }
}
