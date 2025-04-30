import { readFileSync } from 'fs';
import { join } from 'path/posix';
import { CreatorConfig } from './types';


export function loadConfig(): CreatorConfig {
    const configPath = join(__dirname, '../creator-config.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
}
