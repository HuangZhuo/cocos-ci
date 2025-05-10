import { builder } from './builder';
import {
    confirmAction,
    isNativePlatform,
    loadBuildConfig,
    loadConfig,
    saveBuildConfig,
} from './common';
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

    const hotupdateConfig = buildConfig.packages['oops-plugin-hot-update'];
    console.log(`当前构建次数: ${hotupdateConfig.hotUpdateBuildNum}`);

    if (await confirmAction('是否要增加构建次数?')) {
        hotupdateConfig.hotUpdateBuildNum += 1;
        console.log(`更新后的构建次数: ${hotupdateConfig.hotUpdateBuildNum}`);
        saveBuildConfig(platformConfig.configPath, buildConfig);
    }
    const version = `${hotupdateConfig.hotUpdateVersion}.${hotupdateConfig.hotUpdateBuildNum}`;
    console.log(`开始构建 ${platform} 并生成热更新资源 (${version})  ...`);
    // 构建（由插件处理资源导出）
    await builder.handleCommand('build', { platform });
    console.log(`热更新资源生成完成 ${version}`);
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
