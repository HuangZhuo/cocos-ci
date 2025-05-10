export interface ICommandHandler {
    description: string;
    handleCommand: (action: string, options: any) => void | Promise<void>;
}

export type VersionConfig = {
    filePath: string;
    fieldPath: string;
};

export type SemiverType = 'major' | 'minor' | 'patch';

export type PlatformConfig = {
    configPath: string;
    outputName: string;
    previewUrl?: {
        local?: string;
        remote?: string;
    };
    publishCmd?: string;
};

export type CocosCIConfig = {
    creatorPath: string;
    projectPath: string;
    defaultPlatform: string;
    availablePlatforms: Record<string, PlatformConfig>;
    version: VersionConfig;
};

/**
 * 构建发布导出的配置文件格式
 */
export type BuildConfig = {
    platform: BuildPlatform;
    outputName: string;
    taskName: string;
    packages: {
        // 热更新资源导出插件配置
        ['oops-plugin-hot-update']: {
            hotUpdateEnable: boolean;
            hotUpdateVersion: string;
            hotUpdateBuildNum: number;
        };
    };
};

export type BuildPlatform = 'android' | 'ios' | 'web-desktop' | 'web-mobile';

export type CocosProjectConfig = {
    name: string;
    description: string;
    creator: {
        version: string;
    };
};
