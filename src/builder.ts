import { exec, spawn } from 'child_process';
import { loadConfig } from './common';
import { ICommandHandler } from './types';

/**
 * 命令行构建Cocos Creator项目
 * 参考文档：https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-in-command-line.html
 * @param platform 平台名称，不传则使用默认平台
 * @returns
 */
function build(platform?: string): Promise<void> {
    const config = loadConfig();
    const targetPlatform = platform || config.defaultPlatform;
    const platformConfig = config.availablePlatforms[targetPlatform];

    if (!platformConfig) {
        throw new Error(`不支持的平台: ${targetPlatform}`);
    }

    if (!config.creatorPath) {
        throw new Error('请先在creator-config.json中配置Cocos Creator的可执行文件路径');
    }

    return new Promise((resolve, reject) => {
        const args = [
            '--project',
            config.projectPath,
            '--build',
            `configPath=${platformConfig.configPath};outputName=${platformConfig.outputName}`,
        ];

        console.log(`执行构建命令: ${config.creatorPath} ${args.join(' ')}`);
        const child = spawn(config.creatorPath, args);

        child.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        child.on('close', (code) => {
            if (code !== 36) {
                let errorMessage;
                switch (code) {
                    case 32:
                        errorMessage = '构建失败: 构建参数不合法';
                        break;
                    case 34:
                        errorMessage = '构建失败: 构建过程出错，详情请参考构建日志';
                        break;
                    default:
                        errorMessage = `构建进程退出码: ${code}`;
                }
                return reject(new Error(errorMessage));
            }
            resolve();
        });

        child.on('error', (error) => {
            console.error(`构建失败: ${error.message}`);
            reject(error);
        });
    });
}

function preview(platform?: string): void {
    const config = loadConfig();
    const targetPlatform = platform || config.defaultPlatform;
    const platformConfig = config.availablePlatforms[targetPlatform];

    if (!platformConfig?.previewUrl) {
        throw new Error(`平台 ${targetPlatform} 未配置previewUrl`);
    }

    console.log(`正在打开预览: ${platformConfig.previewUrl}`);
    exec(`start ${platformConfig.previewUrl}`);
}

export const builder: ICommandHandler = {
    description: '构建Cocos Creator项目',
    handleCommand: (action: string, options: { platform: string }) => {
        if (action === 'build') {
            build(options.platform);
        } else if (action === 'preview') {
            preview(options.platform);
        }
    },
};
