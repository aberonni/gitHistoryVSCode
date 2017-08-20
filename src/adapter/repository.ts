import { LogEntries, LogEntry } from './git';
import GitExec from './gitExec';
import logEntryParser from './parsers/logParser';

const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const ITEM_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA6';
const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA7';
const LOG_FORMAT_ARGS = ['%d', '%H', '%h', '%T', '%t', '%P', '%p', '%an', '%ae', '%at', '%c', '%ce', '%ct', '%s', '%b', '%N'];
const LOG_FORMAT = `--format=${LOG_ENTRY_SEPARATOR}${[...LOG_FORMAT_ARGS, STATS_SEPARATOR, ITEM_ENTRY_SEPARATOR].join(ITEM_ENTRY_SEPARATOR)}`;

export class Repository {
    constructor(private workspaceRootPath: string) {
    }

    private async exec(args: string[]): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        return await GitExec(args, gitRootPath);
    }
    private async execInShell(args: string[]): Promise<string> {
        const gitRootPath = await this.getGitRoot();
        return await GitExec(args, gitRootPath, true);
    }
    // how to check if a commit has been merged into any other branch
    //  $ git branch --all --contains 019daf673583208aaaf8c3f18f8e12696033e3fc
    //  remotes/origin/chrmarti/azure-account
    //  If the output contains just one branch, then this means NO, its in the same source branch
    // NOTE:
    // When returning logEntry,
    //  Check if anything has a ref of type HEAD, 
    //  If it does, this means that's the head of a particular branch
    //  This means we don't need to draw the graph line all the way up into no where...
    // However, if this branch has been merged, then we need to draw it all the way up (or till its merge has been found)
    //  To do this we need to perform the step of determining if it has been merged
    // Note: Even if we did find a merged location, this doesn't mean we shouldn't stop drawing the line
    //  Its possible the other branch that it has been merged into is out of the current page
    //  In this instance the grap line will have to go up (to no where)...

    private gitRootPath: string;
    public async  getGitRoot(): Promise<string> {
        if (!this.gitRootPath) {
            const gitRootPath = await GitExec(['rev-parse', '--show-toplevel'], this.workspaceRootPath);
            this.gitRootPath = gitRootPath.trim();
        }
        return this.gitRootPath;
    }

    private async getHeadHashes(): Promise<{ ref: string, hash: string }[]> {
        const fullHashArgs = ['show-ref'];
        const fullHashRefsOutput = await this.exec(fullHashArgs);
        return fullHashRefsOutput.split(/\r?\n/g)
            .filter(line => line.length > 0)
            .filter(line => line.indexOf('refs/heads/') > 0 || line.indexOf('refs/remotes/') > 0)
            .map(line => line.trim().split(' '))
            .filter(lineParts => lineParts.length > 1)
            .map(hashAndRef => { return { ref: hashAndRef[1], hash: hashAndRef[0] }; });
    }
    private async getCommitCount(allBranches: boolean = true, searchText?: string): Promise<number> {
        let args = [];
        const LOG_FORMAT = `--format=${LOG_ENTRY_SEPARATOR}%h`;
        if (allBranches) {
            args = ['log', LOG_FORMAT, '--all', '--'];
        }
        else {
            args = ['log', LOG_FORMAT, '--'];
        }
        if (searchText && searchText.length > 0) {
            args.splice(2, 0, `--grep=${searchText}`);
        }

        const isWin = /^win/.test(process.platform);
        if (isWin) {
            args.push('|', 'find', '/c', '/v', '""');
        }
        else {
            args.push('|', 'wc', '-l');
        }

        // Since we're using find and wc (shell commands, we need to execute the command in a shell)
        const output = await this.execInShell(args);
        return parseInt(output.trim());
    }
    public async getCurrentBranch(): Promise<string> {
        const args = ['rev-parse', '--abbrev-ref', 'HEAD'];
        return await this.exec(args);
    }
    public async getObjectHash(object: string): Promise<string> {

        // Get the hash of the given ref
        // E.g. git show --format=%H --shortstat remotes/origin/tyriar/xterm-v3
        const args = ['show', '--format=%H', '--shortstat', object];
        const output = await this.exec(args);
        return output.split(/\r?\n/g)[0].trim();
    }
    public async getRefsContainingCommit(hash: string): Promise<string[]> {
        const args = ['git', 'branch', '--all', '--contains', hash];
        const entries = await this.exec(args);
        return entries.split(/\r?\n/g)
            .map(line => line.trim())
            // Remove the '*' prefix from current branch
            .map(line => line.startsWith('*') ? line.substring(1) : line)
            // Remove the '->' from ref pointers (take first portion)
            .map(ref => ref.indexOf(' ') ? ref.split(' ')[0].trim() : ref);
    }
    public async getLogEntries(pageIndex: number = 0, pageSize: number = 100, allBranches: boolean = true, searchText?: string): Promise<LogEntries> {
        let args = [];
        if (allBranches) {
            args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--numstat', '--summary', '--'];
        }
        else {
            args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--summary', '--'];
        }
        if (searchText && searchText.length > 0) {
            args.splice(2, 0, `--grep=${searchText}`);
        }

        const gitRootPath = await this.getGitRoot();
        const output = await this.exec(args);

        // Run another git history, but get file stats instead of the changes
        const outputWithFileModeChanges = await this.exec(args.map(arg => arg === '--summary' ? '--name-status' : arg));
        const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);

        const items = output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => {
                if (entry.length === 0) {
                    return;
                }
                return logEntryParser(entry, entriesWithFileModeChanges[index], gitRootPath, ITEM_ENTRY_SEPARATOR, STATS_SEPARATOR, LOG_FORMAT_ARGS);
            })
            .filter(logEntry => logEntry !== undefined)
            .map(logEntry => logEntry!);

        const headHashes = await this.getHeadHashes();
        const headHashesOnly = headHashes.map(item => item.hash);
        const headHashMap = new Map<string, string>(headHashes.map(item => [item.ref, item.hash] as [string, string]));

        items.forEach(async item => {
            // Check if this the very last commit of a branch
            // Just check if this is a head commit (if shows up in 'git show-ref')
            item.isLastCommit = headHashesOnly.indexOf(item.hash.full) >= 0;

            // Check if this commit has been merged into another branch
            // Do this only if this is a head commit (we don't care otherwise, only the graph needs it)
            if (!item.isLastCommit) {
                return;
            }
            const refsContainingThisCommit = await this.getRefsContainingCommit(item.hash.full);
            const hashesOfRefs = refsContainingThisCommit
                .filter(ref => headHashMap.has(ref))
                .map(ref => headHashMap.get(ref)!)
                .filter(hash => hash !== item.hash.full);
            // If we have hashes other than current, then yes it has been merged
            item.isThisLastCommitMerged = hashesOfRefs.length > 0;
        });

        const count = await this.getCommitCount(allBranches, searchText);
        return {
            items,
            count
        } as LogEntries;
    }

    public async getCommitDate(hash: string): Promise<Date | undefined> {
        const args = ['show', '--format=%ct', hash];
        const output = await this.exec(args);
        const lines = output.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length === 0) {
            return undefined;
        }

        const unixTime = parseInt(lines[0]);
        if (isNaN(unixTime) || unixTime <= 0) {
            return undefined;
        }
        return new Date(unixTime * 1000);
    }
    public async getCommit(hash: string): Promise<LogEntry | undefined> {
        let args = ['show', LOG_FORMAT, '--decorate=full', '--numstat', '--summary', '--', hash];
        const gitRootPath = await this.getGitRoot();
        const output = await this.exec(args);

        // Run another git history, but get file stats instead of the changes
        const outputWithFileModeChanges = await this.exec(args.map(arg => arg === '--summary' ? '--name-status' : arg));
        const entriesWithFileModeChanges = outputWithFileModeChanges.split(LOG_ENTRY_SEPARATOR);

        const entries = output
            .split(LOG_ENTRY_SEPARATOR)
            .map((entry, index) => logEntryParser(entry, entriesWithFileModeChanges[index], gitRootPath, ITEM_ENTRY_SEPARATOR, STATS_SEPARATOR, LOG_FORMAT_ARGS));

        return entries.length > 0 ? entries[0] : undefined;
    }
}