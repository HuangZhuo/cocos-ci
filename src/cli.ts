import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { addCommand } from './command';
import { BuildCommandHandler } from './commands/build';
import { HotUpdateCommandHandler } from './commands/hotupdate';
import { InitCommandHandler } from './commands/init';
import { ListCommandHandler } from './commands/list';
import { PreviewCommandHandler } from './commands/preview';
import { PublishCommandHandler } from './commands/publish';
import { VersionCommandHandler } from './commands/version';

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJsonContent = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const cliVersion = packageJsonContent.version;

program //
    .version(cliVersion)
    .name('cocos-ci')
    .usage('<command> [options]')
    .description('Cocos Creator CI Tools');

// 使用addCommand函数添加所有命令处理器
addCommand(program, 'list', ListCommandHandler);
addCommand(program, 'init', InitCommandHandler);
addCommand(program, 'version', VersionCommandHandler);
addCommand(program, 'build', BuildCommandHandler);
addCommand(program, 'preview', PreviewCommandHandler);
addCommand(program, 'publish', PublishCommandHandler);
addCommand(program, 'hotupdate', HotUpdateCommandHandler);

// 如果没有任何参数，则显示帮助
if (process.argv.length < 3) {
    program.help();
}
program.parse(process.argv);
