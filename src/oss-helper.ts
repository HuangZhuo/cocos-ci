import { spawn } from 'child_process';
import { statSync } from 'fs';
import { basename } from 'path/posix';

/**
 * 上传文件到 OSS 并更新文件
 * https://help.aliyun.com/zh/oss/developer-reference/upload-objects-6
 */
export async function ossUpload(bucketName: string, localPath: string, remoteDir: string): Promise<boolean> {
    const stats = statSync(localPath);
    let args: string[];
    if (stats.isDirectory()) {
        // 为文件夹在远程创建同名目录
        remoteDir = `${remoteDir}/${basename(localPath)}`;
        args = ['cp', '-r', localPath, `oss://${bucketName}/${remoteDir}/`, '--update'];
    } else if (stats.isFile()) {
        args = ['cp', localPath, `oss://${bucketName}/${remoteDir}/`, '--update'];
    } else {
        console.error('路径既不是文件也不是目录');
        return false;
    }

    return new Promise((resolve) => {
        const child = spawn('ossutil', args);

        child.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        child.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`上传失败，退出码: ${code}`);
                resolve(false);
            } else {
                console.log('上传完成');
                resolve(true);
            }
        });
    });
}
