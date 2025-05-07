import { existsSync, readFileSync } from 'fs';
import { join } from 'path/posix';
import { BuildConfig, BuildPlatform, CreatorConfig } from './types';

export function loadConfig(): CreatorConfig {
    const configPath = join(__dirname, '../cocos-ci.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function loadBuildConfig(buildConfigPath: string): BuildConfig {
    return JSON.parse(readFileSync(buildConfigPath, 'utf-8')) as BuildConfig;
}

export function saveBuildConfig(buildConfigPath: string, config: BuildConfig): void {
    // const content = JSON.stringify(config, null, 2);
}

export function isNativePlatform(platform: BuildPlatform): boolean {
    return platform === 'android' || platform === 'ios';
}

export function isCocosProjectPath(path: string): boolean {
    const creatorSubDir = '.creator';
    const fullPath = join(path, creatorSubDir);
    return existsSync(fullPath);
}
