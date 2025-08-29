import { exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { decode } from 'iconv-lite';
import { join } from 'path/posix';
import { createInterface } from 'readline';
import { BuildConfig, BuildPlatform, CocosCIConfig, CocosProjectConfig, CustomCommand } from './types';

export function loadConfig(): CocosCIConfig {
    const configPath = join(__dirname, '../cocos-ci.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function loadBuildConfig(buildConfigPath: string): BuildConfig {
    return JSON.parse(readFileSync(buildConfigPath, 'utf-8')) as BuildConfig;
}

export function saveBuildConfig(buildConfigPath: string, config: BuildConfig): void {
    const content = JSON.stringify(config, null, 2);
    writeFileSync(buildConfigPath, content);
}

export function loadProjectConfig(projectPath: string): CocosProjectConfig {
    const configPath = join(projectPath, 'package.json');
    return JSON.parse(readFileSync(configPath, 'utf-8')) as CocosProjectConfig;
}

export function isNativePlatform(platform: BuildPlatform): boolean {
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

/** 执行自定义命令 */
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
