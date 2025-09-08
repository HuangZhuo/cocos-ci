import { Command } from 'commander';
import { join } from 'path';
import { CommandHandler } from '../command';
import { isNativePlatform, loadBuildConfig, saveBuildConfig } from '../config-helper';
import { build, confirmAction } from '../exec-helper';
import { ossUpload } from '../oss-helper';

type HotupdateAction = 'generate' | 'upload';

type HotupdateCommandOptions = {
    target: string;
    dryRun?: boolean;
};

export class HotUpdateCommandHandler extends CommandHandler<HotupdateAction, HotupdateCommandOptions> {
    protected description: string = '热更新管理';

    protected initOptions(program: Command): void {
        program
            .argument('<action>', '热更新操作 (generate|upload)')
            .option('--target <target>', '指定目标', 'web-desktop')
            .option('--dry-run', '不实际上传，仅打印命令', false);
    }

    async execute(action: HotupdateAction, options: HotupdateCommandOptions): Promise<boolean> {
        const target = options.target;
        switch (action) {
            case 'generate':
                await this.generate(target);
                break;
            case 'upload':
                await this.upload(target, options);
                break;
            default:
                console.error(`未知的热更新操作: ${action}`);
                return false;
        }
        return true;
    }

    /**
     * 生成热更新资源
     * @param target 目标平台
     */
    private async generate(target: string): Promise<void> {
        const { creatorPath, projectPath } = this.config;
        const { configPath, outputName } = this.getTarget(target);

        const buildConfig = loadBuildConfig(configPath);
        if (!isNativePlatform(buildConfig.platform)) {
            throw new Error(`不支持的非原生平台: ${target}`);
        }

        const hotupdateConfig = buildConfig.packages['oops-plugin-hot-update'];
        console.log(`当前构建次数: ${hotupdateConfig.hotUpdateBuildNum}`);

        if (await confirmAction('是否要增加构建次数?')) {
            hotupdateConfig.hotUpdateBuildNum += 1;
            console.log(`更新后的构建次数: ${hotupdateConfig.hotUpdateBuildNum}`);
            saveBuildConfig(configPath, buildConfig);
        }
        const version = `${hotupdateConfig.hotUpdateVersion}.${hotupdateConfig.hotUpdateBuildNum}`;
        console.log(`开始构建 ${target} 并生成热更新资源 (${version})  ...`);

        // 生成热更新资源过程由 oops 热更新插件处理
        await build(creatorPath, projectPath, configPath, outputName);

        console.log(`热更新资源生成完成 ${version}`);
    }

    /**
     * 上传热更新资源
     * @param target 目标平台
     * @param options 命令行选项
     */
    private async upload(target: string, options: HotupdateCommandOptions): Promise<void> {
        const platformConfig = this.getTarget(target);

        const buildConfig = loadBuildConfig(platformConfig.configPath);
        if (!isNativePlatform(buildConfig.platform)) {
            throw new Error(`不支持的非原生平台: ${target}`);
        }

        const { hotUpdateVersion, hotUpdateBuildNum } = buildConfig.packages['oops-plugin-hot-update'];
        const version = `${hotUpdateVersion}.${hotUpdateBuildNum}`;

        if (!options.dryRun && !(await confirmAction(`是否要上传热更新资源 ${target} ${version}?`))) {
            return;
        }

        console.log(`正在为平台 ${target} ${version} 上传热更新资源...`);
        const { ossBucketName, generatedAssetsPath } = this.config.hotupdate;
        if (!ossBucketName) {
            // 目前仅支持 OSS
            console.error(`请先在creator-config.json中配置OSS Bucket名称`);
            return;
        }
        // 这里需要按顺序依次上传，确保失败后可以回滚
        const assets = [version, 'project.manifest', 'version.manifest'];
        for (const asset of assets) {
            const localPath = join(generatedAssetsPath, platformConfig.outputName, asset);
            const remoteDir = `${platformConfig.outputName}`;
            if (options.dryRun) {
                console.log(`[dry-run] ${localPath} -> oss://${ossBucketName}/${remoteDir}/`);
                continue;
            }
            if (!(await ossUpload(ossBucketName, localPath, remoteDir))) {
                console.error(`上传 ${asset} 失败`);
                return;
            }
        }
        console.log(`热更新资源上传完成 ${version}`);
    }
}
