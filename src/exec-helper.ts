import { exec, spawn } from 'child_process';
import { decode } from 'iconv-lite';
import { createInterface } from 'readline';
import { CustomCommand } from './types';

/** 确认执行 */
export async function confirmAction(question: string): Promise<boolean> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise<boolean>((resolve) => {
        rl.question(`${question} (y/n): `, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

/** 执行自定义命令 (exec) */
export function executeCommand(command: CustomCommand): Promise<void> {
    if (!command) {
        return Promise.reject(new Error('命令为空'));
    }
    return new Promise<void>((resolve, reject) => {
        exec(`"${command}"`, { encoding: 'buffer' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行命令失败: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                const decodedStderr = decode(stderr, 'gbk');
                console.error(decodedStderr);
            }
            // 将 GBK 编码的输出转换为 UTF-8
            const decodedStdout = decode(stdout, 'gbk');
            console.log(decodedStdout);
            resolve();
        });
    });
}

/**
 * 执行 Cocos Creator 构建
 * 参考文档：https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-in-command-line.html
 * @param creatorPath Cocos Creator 可执行文件路径
 * @param projectPath 项目路径
 * @param configPath 构建配置文件路径
 * @param outputName 输出文件名
 * @returns
 */
export function build(
    creatorPath: string, //
    projectPath: string,
    configPath: string,
    outputName: string,
) {
    if (!creatorPath) {
        throw new Error('cocos-ci.json中未配置creatorPath');
    }
    return new Promise<void>((resolve, reject) => {
        const args = [
            '--project', //
            projectPath,
            '--build',
            `configPath=${configPath};outputName=${outputName}`,
        ];

        console.log(`执行构建命令: ${creatorPath} ${args.join(' ')}`);
        const child = spawn(creatorPath, args);

        child.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        child.on('close', (code) => {
            if (code !== 36) {
                let errorMessage;
                switch (code) {
                    case 32:
                        errorMessage = '构建失败: 构建参数不合法';
                        break;
                    case 34:
                        errorMessage = '构建失败: 构建过程出错，详情请参考构建日志';
                        break;
                    default:
                        errorMessage = `构建进程退出码: ${code}`;
                }
                return reject(new Error(errorMessage));
            }
            resolve();
        });

        child.on('error', (error) => {
            console.error(`构建失败: ${error.message}`);
            reject(error);
        });
    });
}
