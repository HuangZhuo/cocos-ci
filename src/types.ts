export type VersionConfig = {
    filePath: string;
    fieldPath: string;
};

export type HotUpdateConfig = {
    // 热更新插件生成资源的路径
    generatedAssetsPath: string;
    ossBucketName?: string;
};

export type OopsPluginHotUpdateConfig = {
    hotUpdateEnable: boolean;
    hotUpdateVersion: string;
    hotUpdateBuildNum: number;
};

export type SemiverType = 'major' | 'minor' | 'patch';

export type CustomCommand = string;

export type BuildTargetConfig = {
    /** Creator 构建配置文件 */
    configPath: string;
    /** 构建到目录 */
    outputName: string;
    /** 构建成功后执行命令 */
    postBuildCmd?: CustomCommand;
    /** 预览链接 */
    previewUrl?: {
        local?: string;
        remote?: string;
    };
    /** 发布命令 */
    publishCmd?: CustomCommand;
};

/** cocos-ci.json */
export type CocosCIConfig = {
    creatorPath: string;
    projectPath: string;
    defaultTarget: string;
    availableTargets: Record<string, BuildTargetConfig>;
    version: VersionConfig;
    hotupdate: HotUpdateConfig;
};

/** Creator 构建发布导出的配置文件格式 */
export type CocosBuildConfig = {
    platform: CocosBuildPlatform;
    // 构建后生成的发布包文件夹名称
    outputName: string;
    taskName: string;
    packages: {
        // 热更新资源导出插件配置
        ['oops-plugin-hot-update']: OopsPluginHotUpdateConfig;
    };
};

/** Creator 构建平台 */
export type CocosBuildPlatform =
    | 'android' // 安卓
    | 'ios'
    | 'wechatgame' // 微信小游戏
    | 'web-mobile'
    | 'web-desktop';

/** Creator 项目内的 package.json */
export type CocosProjectConfig = {
    name: string;
    description: string;
    creator: {
        version: string;
    };
};

export type Ctor<T> = new (...args: any[]) => T;
