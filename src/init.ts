import { writeFileSync } from 'fs';
import { join } from 'path';
import { isCocosProjectPath } from './common';
import { CreatorConfig, ICommandHandler } from './types';

const templateConfig: CreatorConfig = {
    creatorPath: 'C:\\ProgramData\\cocos\\editors\\Creator\\x.x.x\\CocosCreator.exe',
    projectPath: '.\\',
    defaultPlatform: 'web-desktop',
    availablePlatforms: {
        'web-mobile': {
            outputName: 'web-mobile',
            configPath: 'path\\to\\buildConfig_web-mobile.json',
            previewUrl: 'http://localhost:7456/web-mobile/index.html',
        },
        'web-desktop': {
            outputName: 'web-desktop',
            configPath: 'path\\to\\buildConfig_web-desktop.json',
            previewUrl: 'http://localhost:7456/web-desktop/index.html',
        },
    },
    version: {
        filePath: 'path\\to\\version\\config.json',
        fieldPath: 'config.version',
    },
};

export const init: ICommandHandler = {
    description: '初始化配置文件',
    handleCommand: () => {
        if (!isCocosProjectPath(process.cwd())) {
            console.error('当前目录不是Cocos Creator项目');
            process.exit(1);
        }
        const configPath = join(process.cwd(), 'cocos-ci.json');
        writeFileSync(configPath, JSON.stringify(templateConfig, null, 4));
        console.log(`配置文件已生成: ${configPath}`);
        console.log('请根据项目实际情况修改配置');
    },
};
