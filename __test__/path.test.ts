import { basename, join } from 'path';
import { basename as basename_posix } from 'path/posix';

describe('path', () => {
    it('should get basename', () => {
        const path = 'build/wechatgame/remote';
        const name = basename(path);
        expect(name).toBe('remote');
    });

    it('should get basename', () => {
        const path = 'build\\wechatgame\\remote';
        const name = basename(path);
        expect(name).toBe('remote');
    });

    it('should get basename', () => {
        const path = join('build', 'wechatgame', 'remote');
        const name = basename(path);
        expect(name).toBe('remote');
    });

    it('should get basename posix', () => {
        const path = join('build', 'wechatgame', 'remote');
        const name = basename_posix(path);
        expect(name).not.toBe('remote');
        expect(name).toBe('build\\wechatgame\\remote');
    });
});
