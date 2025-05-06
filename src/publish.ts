import { exec } from 'child_process';
import { decode } from 'iconv-lite';
import { loadConfig } from './common';
import { ICommandHandler } from './types';

async function publish(platform: string, options: PublishOptions): Promise<void> {
    try {
        const config = loadConfig();
        const platformConfig = config.availablePlatforms[platform];

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
        exec(`"${platformConfig.publishCmd}"`, { encoding: 'buffer' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`发布失败: ${error.message}`);
                return;
            }

            if (stderr) {
                const decodedStderr = decode(stderr, 'gbk');
                console.error(decodedStderr);
            }
            // 将 GBK 编码的输出转换为 UTF-8
            const decodedStdout = decode(stdout, 'gbk');
            console.log(decodedStdout);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('发布失败:', error.message);
        } else {
            console.error('发布失败:', error);
        }
        throw error;
    }
}

type PublishOptions = {
    platform: string;
    dryRun: boolean;
};

export const publisher: ICommandHandler = {
    description: '构建并发布项目',
    handleCommand: async (action: string, options: PublishOptions) => {
        if (action === 'publish') {
            await publish(options.platform, options);
        }
    },
};
