import { builder } from './builder';
import { isNativePlatform, loadBuildConfig, loadConfig } from './common';
import { ICommandHandler } from './types';

async function generate(platform: string): Promise<void> {
    const config = loadConfig();
    const platformConfig = config.availablePlatforms[platform];

    if (!platformConfig) {
        throw new Error(`不支持的平台: ${platform}`);
    }

    const buildConfig = loadBuildConfig(platformConfig.configPath);
    if (!isNativePlatform(buildConfig.platform)) {
        throw new Error(`不支持的非原生平台: ${platform}`);
    }

    await builder.handleCommand('build', { platform });
}

async function upload(platform: string): Promise<void> {
    const config = loadConfig();
    const platformConfig = config.availablePlatforms[platform];

    if (!platformConfig) {
        throw new Error(`不支持的平台: ${platform}`);
    }

    // 上传资源的逻辑
    console.log(`正在为平台 ${platform} 上传热更新资源...`);
    // 这里添加上传资源的代码
}

type HotupdateOptions = {
    platform: string;
};

export const hotupdate: ICommandHandler = {
    description: '热更新管理',
    handleCommand: async (action: string, options: HotupdateOptions) => {
        if (action === 'generate') {
            await generate(options.platform);
        } else if (action === 'upload') {
            await upload(options.platform);
        }
    },
};
