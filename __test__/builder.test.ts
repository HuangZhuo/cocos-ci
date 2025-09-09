// 测试Builder类的build方法
import { Builder } from '../src/commands/build/builder';
import { loadBuildConfig } from '../src/config-helper';
import { ccbuild } from '../src/exec-helper';

// Mock依赖模块
jest.mock('../src/exec-helper');
jest.mock('../src/config-helper');

const mockCcbuild = ccbuild as jest.MockedFunction<typeof ccbuild>;
const mockLoadBuildConfig = loadBuildConfig as jest.MockedFunction<typeof loadBuildConfig>;

describe('Builder', () => {
    let mockConfig: any;
    let mockTarget: any;
    let mockBuildConfig: any;

    beforeEach(() => {
        // 清除所有mock
        jest.clearAllMocks();

        // 准备mock数据
        mockConfig = {
            creatorPath: 'C:/CocosCreator/Creator.exe',
            projectPath: 'C:/Projects/test-project',
        };

        mockTarget = {
            configPath: 'build-config.json',
            outputName: 'test-output',
        };

        mockBuildConfig = {
            // 模拟构建配置对象
            platform: 'web-mobile',
            debug: true,
        };

        // 设置mock函数的返回值
        mockLoadBuildConfig.mockReturnValue(mockBuildConfig);
        mockCcbuild.mockResolvedValue(undefined);
    });

    it('should call ccbuild method when running build', async () => {
        // 创建Builder实例
        const builder = new Builder(mockConfig);

        // 调用run方法，它会内部调用build方法
        await builder.run(mockTarget);

        // 验证ccbuild函数被正确调用
        expect(mockCcbuild).toHaveBeenCalledTimes(1);
        expect(mockCcbuild).toHaveBeenCalledWith(
            'C:/CocosCreator/Creator.exe',
            'C:/Projects/test-project',
            'build-config.json',
            'test-output',
        );

        // 验证loadBuildConfig函数被正确调用
        expect(mockLoadBuildConfig).toHaveBeenCalledTimes(1);
        expect(mockLoadBuildConfig).toHaveBeenCalledWith('build-config.json');
    });

    it('should handle build failures correctly', async () => {
        // 设置ccbuild模拟函数抛出错误
        const buildError = new Error('构建失败');
        mockCcbuild.mockRejectedValue(buildError);

        // 创建Builder实例
        const builder = new Builder(mockConfig);

        // 验证run方法会正确传播错误
        await expect(builder.run(mockTarget)).rejects.toThrow('构建失败');
    });

    it('should call onBeforeBuild and onAfterBuild hooks when they exist', async () => {
        // 创建一个扩展Builder类来测试钩子函数
        class TestBuilder extends Builder {
            onBeforeBuildCalled = false;
            onAfterBuildCalled = false;

            protected onBeforeBuild(): void {
                this.onBeforeBuildCalled = true;
            }

            protected onAfterBuild(): void {
                this.onAfterBuildCalled = true;
            }
        }

        // 创建TestBuilder实例
        const builder = new TestBuilder(mockConfig);

        // 调用run方法
        await builder.run(mockTarget);

        // 验证钩子函数被调用
        expect(builder.onBeforeBuildCalled).toBe(true);
        expect(builder.onAfterBuildCalled).toBe(true);
    });
});
