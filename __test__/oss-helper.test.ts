// 最简单的oss-helper测试用例
import { spawn } from 'child_process';
import { statSync } from 'fs';
import { ossUpload } from '../src/oss-helper';

// Mock依赖模块
jest.mock('child_process');
jest.mock('fs');

// 类型转换
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
const mockStatSync = statSync as jest.MockedFunction<typeof statSync>;

describe('oss-helper 简单测试', () => {
    beforeEach(() => {
        // 清除所有mock
        jest.clearAllMocks();
    });

    it('基本的文件上传功能测试', async () => {
        // 1. 准备mock数据 - 模拟文件
        mockStatSync.mockReturnValue({
            isDirectory: () => false,
            isFile: () => true,
        } as any);

        // 2. 创建模拟的子进程对象
        const mockChildProcess = {
            stdout: { on: jest.fn() },
            stderr: { on: jest.fn() },
            on: jest.fn().mockImplementation((event, callback) => {
                // 当注册close事件时，立即调用回调表示成功
                if (event === 'close') {
                    setTimeout(() => callback(0), 0);
                }
                return mockChildProcess;
            }),
        };

        mockSpawn.mockReturnValue(mockChildProcess as any);

        // 3. 执行被测函数
        const result = await ossUpload('test-bucket', 'test-file.txt', 'test-dir');

        // 4. 验证结果
        expect(result).toBe(true);
        expect(mockSpawn).toHaveBeenCalledWith('ossutil', [
            'cp',
            'test-file.txt',
            'oss://test-bucket/test-dir/',
            '--update',
        ]);
    });
});
