import { Injectable } from 'container-ioc';
import { CommitDetails, CompareCommitDetails, CompareFileCommitDetails, FileCommitDetails } from '../common/types';
import { CommittedFile } from '../types';
import { DirectoryNode, FileNode, INodeFactory, INodeFactoryService } from './types';

@Injectable()
export class StandardNodeFactory implements INodeFactory {
    public createDirectoryNode(commit: CommitDetails, relativePath: string) {
        return new DirectoryNode(commit, relativePath);
    }
    public createFileNode(commit: CommitDetails, committedFile: CommittedFile) {
        return new FileNode(new FileCommitDetails(commit.workspaceFolder, commit.branch, commit.logEntry, committedFile));
    }
}

@Injectable()
export class ComparisonNodeFactory implements INodeFactory {
    public createDirectoryNode(commit: CommitDetails, relativePath: string) {
        return new DirectoryNode(commit, relativePath);
    }
    public createFileNode(commit: CommitDetails, committedFile: CommittedFile) {
        const compareCommit = commit as CompareCommitDetails;
        return new FileNode(new CompareFileCommitDetails(compareCommit, compareCommit.rightCommit, committedFile));
    }
}

@Injectable()
export class NodeFactoryService implements INodeFactoryService {
    public readonly standard: INodeFactory;
    public readonly comparison: INodeFactory;
    constructor() {
        this.standard = new StandardNodeFactory();
        this.comparison = new ComparisonNodeFactory();
    }
}
