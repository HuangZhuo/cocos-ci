import { Command } from 'commander';
import { CommandHandler } from '../../command';
import { executeCommand } from '../../exec-helper';

type PublishCommandOptions = {
    target: string;
    dryRun?: boolean;
};

export class PublishCommandHandler extends CommandHandler<string, PublishCommandOptions> {
    protected description: string = '构建并发布项目';

    protected initArgumentAndOptions(program: Command): void {
        program
            .option('--target <target>', '指定发布目标', 'web-desktop')
            .option('--dry-run', '不实际发布，仅打印命令', false);
    }

    async execute(options: PublishCommandOptions): Promise<boolean> {
        await this.publish(options.target, options);
        return true;
    }

    private async publish(target: string, options: PublishCommandOptions): Promise<void> {
        try {
            const { publishCmd } = this.getTarget(target);
            // 3. 执行发布命令
            if (!publishCmd) {
                throw new Error(`平台 ${target} 未配置publishCmd`);
            }
            console.log(`执行发布命令: ${publishCmd}`);
            if (options.dryRun) {
                console.log('这是一次模拟发布，不会实际执行任何操作。');
                return;
            }
            await executeCommand(publishCmd);
        } catch (error) {
            if (error instanceof Error) {
                console.error('发布失败:', error.message);
            } else {
                console.error('发布失败:', error);
            }
            throw error;
        }
    }
}
