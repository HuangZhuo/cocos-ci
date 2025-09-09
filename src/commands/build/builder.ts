import path from 'path';
import { loadBuildConfig } from '../../config-helper';
import { ccbuild } from '../../exec-helper';
import { ossUpload } from '../../oss-helper';
import { BuildTargetConfig, CocosBuildConfig, CocosBuildPlatform, CocosCIConfig } from '../../types';

export function getPlatformBuilder(config: CocosCIConfig, platform: CocosBuildPlatform): IBuilder {
    switch (platform) {
        case 'wechatgame':
            return new WechatBuilder(config);
        default:
            return new Builder(config);
    }
}

interface IBuilder {
    run(target: BuildTargetConfig): void;
}

/** 常规构建 */
export class Builder implements IBuilder {
    protected targetConfig: BuildTargetConfig = null!;
    protected buildConfig: CocosBuildConfig = null!;

    constructor(protected config: CocosCIConfig) {}

    async run(target: BuildTargetConfig) {
        this.targetConfig = target;
        this.buildConfig = loadBuildConfig(target.configPath);
        this.onBeforeBuild?.();
        await this.build(target);
        this.onAfterBuild?.();
    }

    /** 使用 Cocos Creator 构建项目 */
    protected async build({ configPath, outputName }: BuildTargetConfig) {
        const { creatorPath, projectPath } = this.config;
        await ccbuild(creatorPath, projectPath, configPath, outputName);
    }

    /** 开始构建前 */
    protected onBeforeBuild?(): void;

    /** 构建完成后 */
    protected onAfterBuild?(): void;
}

/** 微信小游戏构建 */
class WechatBuilder extends Builder {
    protected onAfterBuild(): void {
        console.log('WechatBuilder', 'onAfterBuild');
        // 将 remote 上传到 oss
        const {
            projectPath,
            hotupdate: { ossBucketName },
        } = this.config;
        const { outputName } = this.targetConfig;
        const buildPath = path.join(projectPath, 'build', outputName);
        const remoteAssetsPath = path.join(buildPath, 'remote');
        ossUpload(ossBucketName!, remoteAssetsPath, outputName);
    }
}
