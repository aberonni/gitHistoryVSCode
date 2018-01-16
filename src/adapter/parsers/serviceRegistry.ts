
import { IServiceManager } from '../../ioc/types';
import { ActionDetailsParser } from './actionDetails/parser';
import { FileStatParser } from './fileStat/parser';
import { FileStatStatusParser } from './fileStatStatus/parser';
import { LogParser } from './log/parser';
import { IRefParserService, RefsParser } from './refs/parser';
import { RefParserService } from './refs/parsers/index';
import { IActionDetailsParser, IFileStatParser, IFileStatStatusParser, ILogParser, IRefsParser } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    // serviceManager.addSingleton<IRefParser>(IRefParser, HeadRefParser);
    // serviceManager.addSingleton<IRefParser>(IRefParser, RemoteHeadParser);
    // serviceManager.addSingleton<IRefParser>(IRefParser, TagRefParser);
    serviceManager.addSingleton<IRefsParser>(IRefsParser, RefsParser);
    serviceManager.addSingleton<IRefParserService>(IRefParserService, RefParserService);

    serviceManager.add<IActionDetailsParser>(IActionDetailsParser, ActionDetailsParser);
    serviceManager.add<IFileStatStatusParser>(IFileStatStatusParser, FileStatStatusParser);
    serviceManager.add<IFileStatParser>(IFileStatParser, FileStatParser);
    serviceManager.add<ILogParser>(ILogParser, LogParser);
}
