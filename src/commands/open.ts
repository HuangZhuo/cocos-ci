import { spawn } from 'child_process';
import { Command } from 'commander';
import { statSync } from 'fs';
import { resolve } from 'path';
import { CommandHandler } from '../command';
import { isCocosProjectPath } from '../config-helper';

type OpenCommandOptions = {
    project?: string;
    editor?: string;
};

export class OpenCommandHandler extends CommandHandler<null, OpenCommandOptions> {
    protected description: string = '直接打开 Cocos Creator 项目（跳过 Dashboard 和登录）';

    protected initArgumentAndOptions(program: Command): void {
        program //
            .description('直接打开 Cocos Creator 项目（跳过 Dashboard 和登录）')
            .option('--project <path>', '覆盖配置中的项目路径')
            .option('--editor <path>', '覆盖配置中的编辑器可执行文件路径');
    }

    async execute(options: OpenCommandOptions): Promise<boolean> {
        try {
            const projectPath = resolve(options.project ?? this.config.projectPath);
            const editorPath = resolve(options.editor ?? this.config.creatorPath);
            if (!statSync(projectPath).isDirectory() || !isCocosProjectPath(projectPath)) {
                throw new Error(`无效的 Cocos 项目路径: ${projectPath}`);
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
