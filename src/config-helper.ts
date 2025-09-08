import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path/posix';
import { CocosBuildConfig, CocosBuildPlatform, CocosCIConfig, CocosProjectConfig } from './types';

/** 加载 cocos-ci.json 配置文件 */
export function loadConfig(): CocosCIConfig {
    const configPath = join(__dirname, '../cocos-ci.json');
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

/** 加载 Cocos 项目配置文件 */
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
    const creatorSubDir = '.creator';
    const fullPath = join(path, creatorSubDir);
    return existsSync(fullPath);
}
