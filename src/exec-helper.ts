import { exec } from 'child_process';
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
