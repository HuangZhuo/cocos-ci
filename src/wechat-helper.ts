import { executeCommand } from './exec-helper';

const CLI = 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat';

export function openWechatDevTool(projectPath: string) {
    executeCommand(`"${CLI} -o ${projectPath} -f cocos"`);
}
