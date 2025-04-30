import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { version } from './version';

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJsonContent = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const cliVersion = packageJsonContent.version;

program
    .version(cliVersion)
    .name('hot-update')
    .usage('<command> [options]')
    .description('热更新工具命令行界面');

// 添加version命令
program
    .command('version')
    .description(version.description)
    .option('-s, --show', '显示当前版本')
    .option('-b, --bump <type>', '升级版本号', 'patch')
    .option('-v, --verbose', '显示详细输出')
    .action(version.handleCommand);

// 如果没有参数则显示帮助
if (process.argv.length < 3) {
    program.help();
}

program.parse(process.argv);
