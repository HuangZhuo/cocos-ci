import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import process from 'process';
import { CommandHandler } from '../command';
import { isCocosProjectPath, loadProjectConfig } from '../config-helper';
import { CocosCIConfig } from '../types';

const templateConfig: CocosCIConfig = {
    creatorPath: 'C:\\ProgramData\\cocos\\editors\\Creator\\x.x.x\\CocosCreator.exe',
    projectPath: '.\\',
    defaultTarget: 'web-desktop',
    availableTargets: {
        'web-mobile': {
            outputName: 'web-mobile',
            configPath: 'path\\to\\buildConfig_web-mobile.json',
            previewUrl: {
                local: 'http://localhost:7456/web-mobile/index.html',
            },
            publishCmd: 'echo publish web-mobile',
        },
        'web-desktop': {
            outputName: 'web-desktop',
            configPath: 'path\\to\\buildConfig_web-desktop.json',
            previewUrl: {
                local: 'http://localhost:7456/web-desktop/index.html',
            },
        },
    },
    version: {
        filePath: 'path\\to\\version\\config.json',
        fieldPath: 'config.version',
    },
    hotupdate: {
        generatedAssetsPath: 'path\\to\\hotupdate\\resources',
    },
};

export class InitCommandHandler extends CommandHandler {
    protected description: string = '初始化 cocos-ci 配置文件';

    async execute(action: null, options: null) {
        const projectPath = process.cwd();
        if (!isCocosProjectPath(projectPath)) {
            console.error('当前目录不是Cocos Creator项目');
            return false;
        }
        const projectConfig = loadProjectConfig(projectPath);
        if (!projectConfig) {
            console.error('无法加载项目配置');
            return false;
        }
        const cocosCreatorVersion = projectConfig.creator.version;
        if (cocosCreatorVersion) {
            const versionReplacedPath = templateConfig.creatorPath.replace('x.x.x', cocosCreatorVersion);
            templateConfig.creatorPath = versionReplacedPath;
        }

        const configPath = join(projectPath, 'cocos-ci.json');
        if (existsSync(configPath)) {
            console.error('配置文件已存在');
            return false;
        }
        writeFileSync(configPath, JSON.stringify(templateConfig, null, 4));
        console.log(`配置文件已生成: ${configPath}`);
        console.log('请根据项目实际情况修改配置');
        return true;
    }
}
