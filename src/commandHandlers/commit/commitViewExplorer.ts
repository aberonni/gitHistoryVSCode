import { Inject, Injectable } from 'container-ioc';
import { ICommandManager } from '../../application/types/commandManager';
import { CommitDetails } from '../../common/types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitCommitViewExplorerCommandHandler } from '../types';

@Injectable()
export class GitCommitViewExplorerCommandHandler implements IGitCommitViewExplorerCommandHandler {
    constructor( @Inject(ICommandManager) private commandManager: ICommandManager,
        @Inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory) { }

    @command('git.commit.view.hide', IGitCommitViewExplorerCommandHandler)
    public async hideCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.view.show', false);
    }

    @command('git.commit.view.show', IGitCommitViewExplorerCommandHandler)
    public async showCommitView(_commit: CommitDetails) {
        await this.commandManager.executeCommand('setContext', 'git.commit.view.show', true);
    }

    @command('git.commit.view.showFilesOnly', IGitCommitViewExplorerCommandHandler)
    public async showFilesView(_commit: CommitDetails) {
        this.commitViewerFactory.getCommitViewer().showFilesView();
    }

    @command('git.commit.view.showFolderView', IGitCommitViewExplorerCommandHandler)
    public async showFolderView(_commit: CommitDetails) {
        this.commitViewerFactory.getCommitViewer().showFolderView();
    }
}
