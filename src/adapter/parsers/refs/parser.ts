import { IRefParserService } from './parser';
export * from './types';
import { Inject, Injectable } from 'container-ioc';
import { ILogService } from '../../../common/types';
import { Ref } from '../../../types';
import { IRefsParser } from '../types';

@Injectable()
export class RefsParser implements IRefsParser {
    constructor( @Inject(IRefParserService) private parsers: IRefParserService,
        @Inject(ILogService) private logger: ILogService) {
    }

    /**
     * Parses refs returned by the following two commands
     * git branch --all (only considers)
     * git show-refs
     * git log --format=%D
     */
    public parse(refContent: string): Ref[] {
        const parsers = this.parsers.getRefParsers();
        return (refContent || '').split(',')
            .map(ref => ref.trim())
            .filter(line => line.length > 0)
            .map(ref => {
                const parser = parsers.find(item => item.canParse(ref));
                if (!parser) {
                    this.logger.error(`No parser found for ref '${ref}'`);
                    return;
                }
                return parser.parse(ref);
            })
            .filter(ref => ref !== undefined && ref !== null)
            .map(ref => ref!);
    }
}
