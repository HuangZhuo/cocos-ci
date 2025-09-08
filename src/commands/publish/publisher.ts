import { Command } from 'commander';
import { CommandHandler } from '../../command';
import { loadConfig } from '../../config-helper';
import { executeCommand } from '../../exec-helper';

class PublishCommandOptions {
    target?: string;
    dryRun?: boolean;
}

export class PublishCommandHandler extends CommandHandler<string, PublishCommandOptions> {
    protected description: string = '构建并发布项目';

    protected initOptions(program: Command): void {
        program
            .option('--target <target>', '指定发布目标', 'web-desktop')
            .option('--dry-run', '不实际发布，仅打印命令', false);
    }

    async execute(action: string, options: PublishCommandOptions): Promise<boolean> {
        if (action === 'publish') {
            await this.publish(options.target || 'web-desktop', options);
        }
        return true;
    }

    private async publish(platform: string, options: PublishCommandOptions): Promise<void> {
        try {
            const config = loadConfig();
            const platformConfig = config.availableTargets[platform];

            if (!platformConfig) {
                throw new Error(`不支持的平台: ${platform}`);
            }

            // 3. 执行发布命令
            if (!platformConfig.publishCmd) {
                throw new Error(`平台 ${platform} 未配置publishCmd`);
            }

            console.log(`执行发布命令: ${platformConfig.publishCmd}`);
            if (options.dryRun) {
                console.log('这是一次模拟发布，不会实际执行任何操作。');
                return;
            }
            await executeCommand(platformConfig.publishCmd);
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
