import { exec } from 'child_process';
import { Command } from 'commander';
import { CommandHandler } from '../../command';

type PreviewCommandOptions = {
    target: string;
    remote?: boolean;
};

export class PreviewCommandHandler extends CommandHandler<string, PreviewCommandOptions> {
    protected description: string = '预览构建结果';

    protected initArgumentAndOptions(program: Command): void {
        program //
            .option('--target <target>', '指定预览目标')
            .option('--remote', '使用远程预览URL', false);
    }

    async execute(options: PreviewCommandOptions): Promise<boolean> {
        this.preview(options.target, options.remote);
        return true;
    }

    private preview(target?: string, isRemote = false): void {
        target ||= this.defaultTarget;
        const { previewUrl } = this.getTarget(target);
        const url = isRemote ? previewUrl?.remote : previewUrl?.local;
        if (!url) {
            throw new Error(`平台 ${target} 未配置${isRemote ? '远程' : '本地'}预览URL`);
        }
        console.log(`正在打开${isRemote ? '远程' : '本地'}预览: ${url}`);
        exec(`start ${url}`);
    }
}
