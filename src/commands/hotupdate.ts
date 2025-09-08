import { Command } from 'commander';
import { join } from 'path';
import { CommandHandler } from '../command';
import { isNativePlatform, loadBuildConfig, loadConfig, saveBuildConfig } from '../config-helper';
import { confirmAction } from '../exec-helper';
import { ossUpload } from '../oss-helper';
import { BuildCommandHandler } from './build/builder';

export type HotupdateAction = 'generate' | 'upload';

class HotupdateCommandOptions {
    target?: string;
    dryRun?: boolean;
}

export class HotUpdateCommandHandler extends CommandHandler<HotupdateAction, HotupdateCommandOptions> {
    protected description: string = '热更新管理';

    protected initOptions(program: Command): void {
        program
            .argument('<action>', '热更新操作 (generate|upload)')
            .option('--target <target>', '指定目标', 'web-desktop')
            .option('--dry-run', '不实际上传，仅打印命令', false);
    }

    async execute(action: HotupdateAction, options: HotupdateCommandOptions): Promise<boolean> {
        const platform = options.target || 'web-desktop';

        if (action === 'generate') {
            await this.generate(platform);
        } else if (action === 'upload') {
            await this.upload(platform, options);
        } else {
            console.error(`未知的热更新操作: ${action}`);
            return false;
        }
        return true;
    }

    private async generate(platform: string): Promise<void> {
        const config = loadConfig();
        const platformConfig = config.availableTargets[platform];

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

        // 创建BuildCommandHandler实例并调用build方法
        const buildHandler = new BuildCommandHandler(this.program, 'build');
        await buildHandler.execute('build', { target: platform });

        console.log(`热更新资源生成完成 ${version}`);
    }

    private async upload(platform: string, options: HotupdateCommandOptions): Promise<void> {
        const config = loadConfig();
        const platformConfig = config.availableTargets[platform];

        if (!platformConfig) {
            throw new Error(`不支持的平台: ${platform}`);
        }

        const buildConfig = loadBuildConfig(platformConfig.configPath);
        if (!isNativePlatform(buildConfig.platform)) {
            throw new Error(`不支持的非原生平台: ${platform}`);
        }

        const oopsHotupdateConfig = buildConfig.packages['oops-plugin-hot-update'];
        const version = `${oopsHotupdateConfig.hotUpdateVersion}.${oopsHotupdateConfig.hotUpdateBuildNum}`;

        if (!options.dryRun && !(await confirmAction(`是否要上传热更新资源 ${platform} ${version}?`))) {
            return;
        }

        console.log(`正在为平台 ${platform} ${version} 上传热更新资源...`);
        const { ossBucketName, generatedAssetsPath } = config.hotupdate;
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
