export interface ICommandHandler {
    description: string;
    handleCommand: (action: string, options: any) => void | Promise<void>;
}

export type VersionConfig = {
    filePath: string;
    fieldPath: string;
};

export type SemiverType = 'major' | 'minor' | 'patch';

type PlatformConfig = {
    configPath: string;
    outputName: string;
    previewUrl?: string;
    publishCmd?: string;
};

export type CreatorConfig = {
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
        ['oops-plugin-hot-update']: {
            hotUpdateBuildNum: number;
        };
    };
};

export type BuildPlatform = 'android' | 'ios' | 'web-desktop' | 'web-mobile';
