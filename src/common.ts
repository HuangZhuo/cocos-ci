import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path/posix';
import { createInterface } from 'readline';
import { BuildConfig, BuildPlatform, CocosCIConfig, CocosProjectConfig } from './types';

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
