import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CocosBuildConfig, CocosBuildPlatform, CocosCIConfig, CocosProjectConfig } from './types';

const COCOS_CI_JSON = 'cocos-ci.json';
const DOT_CREATOR = '.creator';

/** 加载 cocos-ci.json 配置文件 */
export function loadConfig(): Readonly<CocosCIConfig> {
    const configPath = COCOS_CI_JSON;
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}

/** 加载 Cocos 导出的构建配置文件 */
export function loadBuildConfig(buildConfigPath: string): CocosBuildConfig {
    return JSON.parse(readFileSync(buildConfigPath, 'utf-8')) as CocosBuildConfig;
}

/** 保存 Cocos 导出的构建配置文件 */
export function saveBuildConfig(buildConfigPath: string, config: CocosBuildConfig): void {
    const content = JSON.stringify(config, null, 2);
    writeFileSync(buildConfigPath, content);
}

/** 加载 Cocos 项目配置文件 package.json */
export function loadProjectConfig(projectPath: string): CocosProjectConfig {
    const configPath = join(projectPath, 'package.json');
    return JSON.parse(readFileSync(configPath, 'utf-8')) as CocosProjectConfig;
}

/** 检查平台是否为原生平台 */
export function isNativePlatform(platform: CocosBuildPlatform): boolean {
    return platform === 'android' || platform === 'ios';
}

/** 检查路径是否为 Cocos 项目路径 */
export function isCocosProjectPath(path: string): boolean {
    const creatorSubDir = DOT_CREATOR;
    const fullPath = join(path, creatorSubDir);
    return existsSync(fullPath);
}
