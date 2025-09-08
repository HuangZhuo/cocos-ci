import { exec } from 'child_process';
import { Command } from 'commander';
import { CommandHandler } from '../../command';
import { loadConfig } from '../../config-helper';

class PreviewCommandOptions {
    target?: string;
    remote?: boolean;
}

export class PreviewCommandHandler extends CommandHandler<string, PreviewCommandOptions> {
    protected description: string = '预览构建结果';

    protected initOptions(program: Command): void {
        program.option('--target <target>', '指定预览目标', 'web-desktop').option('--remote', '使用远程预览URL', false);
    }

    async execute(options: PreviewCommandOptions): Promise<boolean> {
        this.preview(options.target, options.remote);
        return true;
    }

    private preview(platform?: string, isRemote = false): void {
        const config = loadConfig();
        const targetPlatform = platform || config.defaultTarget;
        const platformConfig = config.availableTargets[targetPlatform];

        if (!platformConfig?.previewUrl) {
            throw new Error(`平台 ${targetPlatform} 未配置preview`);
        }

        const url = isRemote ? platformConfig.previewUrl.remote : platformConfig.previewUrl.local;
        if (!url) {
            throw new Error(`平台 ${targetPlatform} 未配置${isRemote ? '远程' : '本地'}预览URL`);
        }

        console.log(`正在打开${isRemote ? '远程' : '本地'}预览: ${url}`);
        exec(`start ${url}`);
    }
}
