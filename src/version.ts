import { readFileSync, writeFileSync } from 'fs';
import { loadConfig } from './common';
import { ICommandHandler, SemiverType, VersionConfig } from './types';

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

function bumpVersion(config: VersionConfig, type: SemiverType): void {
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
        const config = loadConfig().version;
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

function bump(type: SemiverType = 'patch') {
    try {
        if (!['major', 'minor', 'patch'].includes(type)) {
            throw new Error('Invalid bump type. Must be one of: major, minor, patch');
        }

        const config = loadConfig();
        bumpVersion(config.version, type);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

export const version: ICommandHandler = {
    description: '版本管理',
    handleCommand: (action: string, options: { type?: SemiverType }) => {
        if (action === 'show') {
            show();
        } else if (action === 'bump') {
            bump(options.type ?? 'patch');
        } else {
            show();
        }
    },
};
