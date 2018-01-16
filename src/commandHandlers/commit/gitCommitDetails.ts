import { Inject, Injectable } from 'container-ioc';
import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { ICommitViewerFactory } from '../../viewers/types';
import { IGitCommitViewDetailsCommandHandler } from '../types';

@Injectable()
export class GitCommitViewDetailsCommandHandler implements IGitCommitViewDetailsCommandHandler {
    constructor( @Inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @Inject(ICommandManager) private commandManager: ICommandManager) { }

    public async viewDetails(commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.selected', true);
        this.serviceContainer.get<ICommitViewerFactory>(ICommitViewerFactory).getCommitViewer().showCommit(commit);
    }

    public async viewCommitTree(commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.selected', true);
        this.serviceContainer.get<ICommitViewerFactory>(ICommitViewerFactory).getCommitViewer().showCommitTree(commit);
    }
}
