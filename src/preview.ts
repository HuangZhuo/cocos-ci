import { exec } from 'child_process';
import { loadConfig } from './common';
import { ICommandHandler } from './types';

export function preview(platform?: string, isRemote = false): void {
    const config = loadConfig();
    const targetPlatform = platform || config.defaultPlatform;
    const platformConfig = config.availablePlatforms[targetPlatform];

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

type PreviewOptions = {
    platform?: string;
    remote?: boolean;
};

export const previewer: ICommandHandler = {
    description: '预览构建结果',
    handleCommand: async (action: string, options: PreviewOptions) => {
        if (action === 'preview') {
            preview(options.platform, options.remote);
        }
    },
};
