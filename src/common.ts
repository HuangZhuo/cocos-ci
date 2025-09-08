import { exec, spawn } from 'child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { decode } from 'iconv-lite';
import { basename, join } from 'path/posix';
import { createInterface } from 'readline';
import { CocosBuildConfig, CocosBuildPlatform, CocosCIConfig, CocosProjectConfig, CustomCommand } from './types';

export function loadConfig(): CocosCIConfig {
    const configPath = join(__dirname, '../cocos-ci.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function loadBuildConfig(buildConfigPath: string): CocosBuildConfig {
    return JSON.parse(readFileSync(buildConfigPath, 'utf-8')) as CocosBuildConfig;
}

export function saveBuildConfig(buildConfigPath: string, config: CocosBuildConfig): void {
    const content = JSON.stringify(config, null, 2);
    writeFileSync(buildConfigPath, content);
}

export function loadProjectConfig(projectPath: string): CocosProjectConfig {
    const configPath = join(projectPath, 'package.json');
    return JSON.parse(readFileSync(configPath, 'utf-8')) as CocosProjectConfig;
}

export function isNativePlatform(platform: CocosBuildPlatform): boolean {
    return platform === 'android' || platform === 'ios';
}

export function isCocosProjectPath(path: string): boolean {
    const creatorSubDir = '.creator';
    const fullPath = join(path, creatorSubDir);
    return existsSync(fullPath);
}

/** 确认执行 */
export async function confirmAction(question: string): Promise<boolean> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise<boolean>((resolve) => {
        rl.question(`${question} (y/n): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

/** 执行自定义命令 (exec) */
export function executeCommand(command: CustomCommand): Promise<void> {
    if (!command) {
        return Promise.reject(new Error('命令为空'));
    }
    return new Promise<void>((resolve, reject) => {
        exec(`"${command}"`, { encoding: 'buffer' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行命令失败: ${error.message}`);
                reject(error);
                return;
            }

            if (stderr) {
                const decodedStderr = decode(stderr, 'gbk');
                console.error(decodedStderr);
            }
            // 将 GBK 编码的输出转换为 UTF-8
            const decodedStdout = decode(stdout, 'gbk');
            console.log(decodedStdout);
            resolve();
        });
    });
}

/**
 * 上传文件到 OSS 并更新文件
 * https://help.aliyun.com/zh/oss/developer-reference/upload-objects-6
 */
export async function ossUpload(bucketName: string, localPath: string, remoteDir: string): Promise<boolean> {
    const stats = statSync(localPath);
    let args: string[];
    if (stats.isDirectory()) {
        // 为文件夹在远程创建同名目录
        remoteDir = `${remoteDir}/${basename(localPath)}`;
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
