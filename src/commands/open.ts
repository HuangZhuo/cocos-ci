import { spawn } from 'child_process';
import { Command } from 'commander';
import { existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { CommandHandler } from '../command';
import { isCocosProjectPath, loadProjectConfig } from '../config-helper';

type OpenCommandOptions = {
    project?: string;
    editor?: string;
};

export class OpenCommandHandler extends CommandHandler<null, OpenCommandOptions> {
    protected description: string = '直接打开 Cocos Creator 项目（跳过 Dashboard 和登录）';

    protected initArgumentAndOptions(program: Command): void {
        program //
            .description('直接打开 Cocos Creator 项目（跳过 Dashboard 和登录）')
            .option('--project <path>', '项目路径，默认使用配置或当前目录')
            .option('--editor <path>', '编辑器路径，默认使用配置或按项目版本查找');
    }

    async execute(options: OpenCommandOptions): Promise<boolean> {
        try {
            const config = existsSync(resolve(process.cwd(), 'cocos-ci.json')) ? this.config : undefined;
            const projectPath = resolve(options.project ?? config?.projectPath ?? process.cwd());
            if (!statSync(projectPath).isDirectory() || !isCocosProjectPath(projectPath)) {
                throw new Error(`无效的 Cocos 项目路径: ${projectPath}`);
            }
            let editor = options.editor ?? config?.creatorPath;
            if (!editor) {
                const version = loadProjectConfig(projectPath).creator?.version;
                if (process.platform !== 'win32' || !version || !/^\d+\.\d+\.\d+[\w.-]*$/.test(version)) {
                    throw new Error('无法自动确定编辑器路径，请使用 --editor 指定');
                }
                editor = join(
                    process.env.ProgramData || 'C:\\ProgramData',
                    'cocos',
                    'editors',
                    'Creator',
                    version,
                    'CocosCreator.exe',
                );
            }
            const editorPath = resolve(editor);
            if (!existsSync(editorPath)) {
                throw new Error(`找不到编辑器: ${editorPath}，请使用 --editor 指定`);
            }
            if (!statSync(editorPath).isFile()) {
                throw new Error(`编辑器路径不是文件: ${editorPath}`);
            }

            // 不经过 shell，保留包含空格的路径；命令退出后编辑器继续运行。
            await new Promise<void>((resolve, reject) => {
                const child = spawn(editorPath, ['--project', projectPath, '--nologin'], {
                    detached: true,
                    stdio: 'ignore',
                    shell: false,
                });
                child.once('error', reject);
                child.once('spawn', () => {
                    child.unref();
                    resolve();
                });
            });
            console.log(`编辑器已启动: ${projectPath}`);
            return true;
        } catch (error) {
            console.error('打开项目失败:', error);
            process.exitCode = 1;
            return false;
        }
    }
}
