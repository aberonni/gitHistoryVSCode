import { Inject, Injectable } from 'container-ioc';
import { OutputChannel } from 'vscode';
import { ICommandManager } from '../application/types/commandManager';
import { IFileCommitCommandFactory } from '../commandFactories/types';
import { ICommitViewFormatter } from '../formatters/types';
import { NodeBuilder } from '../nodes/nodeBuilder';
import { INodeFactoryService } from '../nodes/types';
import { IPlatformService } from '../platform/types';
import { IOutputChannel } from '../types';
import { CommitViewer } from './commitViewer';
import { ICommitViewer, ICommitViewerFactory } from './types';

@Injectable()
export class CommitViewerFactory implements ICommitViewerFactory {
    private commitViewer: ICommitViewer;
    private compareViewer: ICommitViewer;
    constructor( @Inject(IOutputChannel) private outputChannel: OutputChannel,
        @Inject(ICommitViewFormatter) private commitFormatter: ICommitViewFormatter,
        @Inject(ICommandManager) private commandManager: ICommandManager,
        @Inject(IPlatformService) private platformService: IPlatformService,
        @Inject(IFileCommitCommandFactory) private fileCommitFactory: IFileCommitCommandFactory,
        @Inject(INodeFactoryService) private standardNodeFactoryService: INodeFactoryService) {
    }
    public getCommitViewer(): ICommitViewer {
        if (this.commitViewer) {
            return this.commitViewer;
        }
        return this.commitViewer = new CommitViewer(this.outputChannel, this.commitFormatter,
            this.commandManager, new NodeBuilder(this.fileCommitFactory, this.standardNodeFactoryService.standard, this.platformService),
            'commitViewProvider', 'git.commit.view.show');
    }
    public getCompareCommitViewer(): ICommitViewer {
        if (this.compareViewer) {
            return this.compareViewer;
        }
        return this.compareViewer = new CommitViewer(this.outputChannel, this.commitFormatter,
            this.commandManager, new NodeBuilder(this.fileCommitFactory, this.standardNodeFactoryService.comparison, this.platformService),
            'compareCommitViewProvider', 'git.commit.compare.view.show');
    }
}
