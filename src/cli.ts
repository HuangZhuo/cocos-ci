import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { builder } from './builder';
import { version } from './version';

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJsonContent = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const cliVersion = packageJsonContent.version;

program
    .version(cliVersion)
    .name('hot-update')
    .usage('<command> [options]')
    .description('Cocos Creator CI Tools');

// 添加version命令
program
    .command('version')
    .description(version.description)
    .argument('[action]', 'version操作 (show|bump)', 'show')
    .option('--type <type>', '当action为bump时指定版本类型', 'patch')
    .action((action, options) => version.handleCommand(action, options));

// 在version命令后添加build命令
program
    .command('build')
    .description(builder.description)
    .option('--platform <platform>', '指定构建平台', 'web-desktop')
    .action((options) => builder.handleCommand('build', options));

program
    .command('preview')
    .description('预览构建结果')
    .option('--platform <platform>', '指定预览平台', 'web-desktop')
    .action((options) => builder.handleCommand('preview', options));

// 如果没有参数则显示帮助
if (process.argv.length < 3) {
    program.help();
}

program.parse(process.argv);
