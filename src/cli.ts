import { program } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';
import { builder } from './build/builder';
import { hotupdate } from './hotupdate';
import { init } from './init';
import { previewer } from './preview/previewer';
import { publisher } from './publish/publisher';
import { version } from './version';

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJsonContent = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const cliVersion = packageJsonContent.version;

program //
    .version(cliVersion)
    .name('cocos-ci')
    .usage('<command> [options]')
    .description('Cocos Creator CI Tools');

// 添加init命令
program
    .command('init')
    .description('初始化cocos-ci配置文件')
    .action(() => init.handleCommand('', null));

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
    .option('--target <target>', '指定构建目标', 'web-desktop')
    .action((options) => builder.handleCommand('build', options));

// 预览
program
    .command('preview')
    .description(previewer.description)
    .option('--target <target>', '指定预览目标', 'web-desktop')
    .option('--remote', '使用远程预览URL', false)
    .action((options) => previewer.handleCommand('preview', options));

// 添加publish命令
program
    .command('publish')
    .description(publisher.description)
    .option('--target <target>', '指定发布目标', 'web-desktop')
    .option('--dry-run', '不实际发布，仅打印命令', false)
    .action((options) => publisher.handleCommand('publish', options));

// 添加hotupdate命令
program
    .command('hotupdate')
    .description('热更新管理')
    .argument('<action>', '热更新操作 (generate|upload)')
    .option('--target <target>', '指定目标', 'web-desktop')
    .option('--dry-run', '不实际上传，仅打印命令', false)
    .action((action, options) => hotupdate.handleCommand(action, options));

// 如果没有任何参数，则显示帮助
if (process.argv.length < 3) {
    program.help();
}
program.parse(process.argv);
