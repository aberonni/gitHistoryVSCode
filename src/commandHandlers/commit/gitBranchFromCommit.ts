import { Inject, Injectable } from 'container-ioc';
import { IApplicationShell } from '../../application/types';
import { CommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitBranchFromCommitCommandHandler } from '../types';

@Injectable()
export class GitBranchFromCommitCommandHandler implements IGitBranchFromCommitCommandHandler {
    constructor( @Inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @Inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @Inject(IApplicationShell) private applicationShell: IApplicationShell) { }

    @command('git.commit.createBranch', IGitBranchFromCommitCommandHandler)
    public async createBranchFromCommit(commit: CommitDetails) {
        commit = commit ? commit : this.commitViewerFactory.getCommitViewer().selectedCommit;
        const msg = 'Branch name';
        const description = 'Please provide a branch name';
        const newBranchName = await this.applicationShell.showInputBox({ placeHolder: msg, prompt: description });

        if (typeof newBranchName !== 'string' || newBranchName.length === 0) {
            return;
        }

        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        gitService.createBranch(newBranchName, commit.logEntry.hash.full)
            .catch(async err => {
                const currentBranchName = await gitService.getCurrentBranch();
                if (typeof err === 'string' && currentBranchName !== newBranchName) {
                    this.applicationShell.showErrorMessage(err);
                }
            });
    }
}
