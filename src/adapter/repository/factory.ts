import { Inject, Injectable } from 'container-ioc';
import * as md5 from 'md5';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { IGitArgsService } from './types';

@Injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    constructor( @Inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @Inject(ILogParser) private logParser: ILogParser,
        @Inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @Inject(IServiceContainer) private serviceContainer: IServiceContainer) {

    }
    public createGitService(workspaceRoot: string): IGitService {
        const id = md5(workspaceRoot);
        if (!this.gitServices.has(id)) {
            this.gitServices.set(id, new Git(this.serviceContainer, workspaceRoot, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }
        return this.gitServices.get(id)!;
    }
}
