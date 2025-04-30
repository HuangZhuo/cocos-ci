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
    .argument('[action]', 'version操作 (show|bump)', 'show')
    .option('--type <type>', '当action为bump时指定版本类型', 'patch')
    .action((action, options) => version.handleCommand(action, options));

// 如果没有参数则显示帮助
if (process.argv.length < 3) {
    program.help();
}

program.parse(process.argv);
