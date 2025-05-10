import { spawn } from 'child_process';
import { statSync } from 'fs';
import { dirname, join } from 'path';
import { builder } from './builder';
import { confirmAction, isNativePlatform, loadBuildConfig, loadConfig, saveBuildConfig } from './common';
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

    const buildConfig = loadBuildConfig(platformConfig.configPath);
    if (!isNativePlatform(buildConfig.platform)) {
        throw new Error(`不支持的非原生平台: ${platform}`);
    }

    const oopsHotupdateConfig = buildConfig.packages['oops-plugin-hot-update'];
    const version = `${oopsHotupdateConfig.hotUpdateVersion}.${oopsHotupdateConfig.hotUpdateBuildNum}`;

    if (!(await confirmAction(`是否要上传热更新资源 ${platform} ${version}?`))) {
        return;
    }

    console.log(`正在为平台 ${platform} 上传热更新资源...`);
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
        if (!(await ossUpload(ossBucketName, localPath, remoteDir))) {
            console.error(`上传 ${asset} 失败`);
            return;
        }
    }
    console.log(`热更新资源上传完成 ${version}`);
}

/**
 * 上传文件到 OSS 并更新文件
 * https://help.aliyun.com/zh/oss/developer-reference/upload-objects-6
 */
async function ossUpload(bucketName: string, localPath: string, remoteDir: string): Promise<boolean> {
    const stats = statSync(localPath);
    let args: string[];
    if (stats.isDirectory()) {
        // 为文件夹在远程创建同名目录
        remoteDir = join(remoteDir, dirname(localPath));
        args = ['cp', '-r', localPath, `oss://${bucketName}/${remoteDir}/`, '--update'];
    } else if (stats.isFile()) {
        args = ['cp', localPath, `oss://${bucketName}/${remoteDir}/`, '--update'];
    } else {
        console.error('路径既不是文件也不是目录');
        return false;
    }

    return new Promise((resolve) => {
        const child = spawn('ossutil', args);

        child.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`上传失败，退出码: ${code}`);
                resolve(false);
            } else {
                console.log('上传完成');
                resolve(true);
            }
        });
    });
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
