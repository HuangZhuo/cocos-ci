export interface ICommandHandler {
    description: string;
    handleCommand: (action: string, options: any) => void;
}

export type VersionConfig = {
    filePath: string;
    fieldPath: string;
};

export type SemiverType = 'major' | 'minor' | 'patch';

interface PlatformConfig {
    configPath: string;
    outputName: string;
}

export interface CreatorConfig {
    creatorPath: string;
    projectPath: string;
    defaultPlatform: string;
    availablePlatforms: Record<string, PlatformConfig>;
}
