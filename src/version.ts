import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { program } from 'commander';

type VersionConfig = {
    filePath: string;
    fieldPath: string;
};

function loadConfig(): VersionConfig {
    const configPath = join(__dirname, '../creator-config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.version;
}

function getVersion(config: VersionConfig): string {
    const content = JSON.parse(readFileSync(config.filePath, 'utf-8'));
    const pathParts = config.fieldPath.split('.');

    let current = content;
    for (const part of pathParts) {
        current = current[part];
        if (current === undefined) {
            throw new Error(`Invalid version path: ${config.fieldPath}`);
        }
    }

    return current;
}

function bumpVersion(config: VersionConfig, type: 'major' | 'minor' | 'patch'): void {
    const content = JSON.parse(readFileSync(config.filePath, 'utf-8'));
    const pathParts = config.fieldPath.split('.');

    let current = content;
    for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
        if (current === undefined) {
            throw new Error(`Invalid version path: ${config.fieldPath}`);
        }
    }

    const versionField = pathParts[pathParts.length - 1];
    const version = current[versionField];

    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        throw new Error(`Version format must be semver (x.y.z): ${version}`);
    }

    const [major, minor, patch] = version.split('.').map(Number);

    let newVersion: string;
    switch (type) {
        case 'major':
            newVersion = `${major + 1}.0.0`;
            break;
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`;
            break;
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`;
            break;
    }

    current[versionField] = newVersion;
    writeFileSync(config.filePath, JSON.stringify(content, null, 2));
    console.log(`Version bumped from ${version} to ${newVersion}`);
}

function show() {
    try {
        const config = loadConfig();
        const version = getVersion(config);
        console.log(`Current version: ${version}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error?.message);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

function bump(type: 'major' | 'minor' | 'patch' = 'patch') {
    try {
        if (!['major', 'minor', 'patch'].includes(type)) {
            throw new Error('Invalid bump type. Must be one of: major, minor, patch');
        }

        const config = loadConfig();
        bumpVersion(config, type);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

export const version = {
    description: '版本管理',
    handleCommand: () => {
        const options = program.opts();
        if (options.show) {
            show();
        } else if (options.bump) {
            bump(options.bump ?? 'patch');
        } else {
            show();
        }
    },
};
