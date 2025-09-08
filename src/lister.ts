import { loadConfig } from './common';
import { ICommandHandler } from './types';

export const lister: ICommandHandler = {
    description: '列出所有构建目标',
    handleCommand: async (action, options) => {
        const config = loadConfig();
        console.log(Object.keys(config.availableTargets));
    },
};
