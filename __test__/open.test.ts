import { spawn } from 'child_process';
import { Command } from 'commander';
import { EventEmitter } from 'events';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { OpenCommandHandler } from '../src/commands/open';

jest.mock('child_process');
jest.mock('../src/config-helper', () => ({
    ...jest.requireActual('../src/config-helper'),
    loadConfig: () => ({ creatorPath: 'configured editor.exe', projectPath: 'configured project' }),
}));

describe('open', () => {
    let root: string;
    let project: string;
    let editor: string;
    let handler: OpenCommandHandler;
    let child: EventEmitter & { unref: jest.Mock };
    const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

    beforeEach(() => {
        root = mkdtempSync(join(tmpdir(), 'cocos-ci-open-'));
        project = join(root, 'project with spaces');
        editor = join(root, 'editor with spaces.exe');
        mkdirSync(join(project, '.creator'), { recursive: true });
        writeFileSync(editor, '');
        handler = new OpenCommandHandler(new Command(), 'open');
        child = Object.assign(new EventEmitter(), { unref: jest.fn() });
        mockSpawn.mockImplementation(() => {
            process.nextTick(() => child.emit('spawn'));
            return child as unknown as ReturnType<typeof spawn>;
        });
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        process.exitCode = 0;
        jest.restoreAllMocks();
        rmSync(root, { recursive: true, force: true });
    });

    it('launches directly with login disabled and preserves paths containing spaces', async () => {
        await expect(handler.execute({ project, editor })).resolves.toBe(true);
        expect(mockSpawn).toHaveBeenCalledWith(editor, ['--project', project, '--nologin'], {
            detached: true,
            stdio: 'ignore',
            shell: false,
        });
        expect(child.unref).toHaveBeenCalledTimes(1);
    });

    it('uses configured paths when overrides are omitted', async () => {
        jest.spyOn(handler as any, 'config', 'get').mockReturnValue({
            projectPath: project,
            creatorPath: editor,
        });
        await expect(handler.execute({})).resolves.toBe(true);
        expect(mockSpawn.mock.calls[0][0]).toBe(resolve(editor));
        expect(mockSpawn.mock.calls[0][1]).toEqual(['--project', resolve(project), '--nologin']);
    });

    it('rejects directories without a Cocos project marker', async () => {
        await expect(handler.execute({ project: root, editor })).resolves.toBe(false);
        expect(mockSpawn).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it('rejects a directory as the editor path', async () => {
        await expect(handler.execute({ project, editor: root })).resolves.toBe(false);
        expect(mockSpawn).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it('reports a missing editor without launching', async () => {
        await expect(handler.execute({ project, editor: join(root, 'missing.exe') })).resolves.toBe(false);
        expect(mockSpawn).not.toHaveBeenCalled();
        expect(process.exitCode).toBe(1);
    });

    it('reports asynchronous launch failures', async () => {
        mockSpawn.mockImplementation(() => {
            process.nextTick(() => child.emit('error', new Error('EACCES')));
            return child as unknown as ReturnType<typeof spawn>;
        });
        await expect(handler.execute({ project, editor })).resolves.toBe(false);
        expect(process.exitCode).toBe(1);
        expect(child.unref).not.toHaveBeenCalled();
    });
});
