import log from 'electron-log/main';
import getAppDataPath from 'appdata-path';
import path from 'path';
import { LogMessage, PathVariables } from 'electron-log';

function logPathResolver(
    variables: PathVariables,
    message?: LogMessage,
): string {
    return path.join(getAppDataPath('open-bafang-tool'), 'logs/log.log');
}

export function initializeLogs() {
    log.initialize();

    log.transports.file.level = 'info';
    log.transports.file.resolvePathFn = logPathResolver;
}
