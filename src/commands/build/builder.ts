import { Command } from 'commander';
import { CommandHandler } from '../../command';
import { build } from '../../exec-helper';

type BuildCommandOptions = {
    target: string;
};

export class BuildCommandHandler extends CommandHandler<string, BuildCommandOptions> {
    protected description: string = '构建Cocos Creator项目';

    protected initOptions(program: Command): void {
        program.option('--target <target>', '指定构建目标', 'web-desktop');
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
        const { creatorPath, projectPath } = this.config;
        const { configPath, outputName } = this.getTarget(target);

        await build(creatorPath, projectPath, configPath, outputName);
    }
}
