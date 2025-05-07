import { readFileSync } from 'fs';
import { join } from 'path/posix';
import { BuildConfig, BuildPlatform, CreatorConfig } from './types';

export function loadConfig(): CreatorConfig {
    const configPath = join(__dirname, '../creator-config.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function loadBuildConfig(buildConfigPath: string): BuildConfig {
    return JSON.parse(readFileSync(buildConfigPath, 'utf-8')) as BuildConfig;
}

export function isNativePlatform(platform: BuildPlatform): boolean {
    return platform === 'android' || platform === 'ios';
}
