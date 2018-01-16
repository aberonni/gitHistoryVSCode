import { Injectable } from 'container-ioc';
import { IRefParser, IRefParserService } from '../parser';
import { HeadRefParser } from './headRefParser';
import { RemoteHeadParser } from './remoteHeadParser';
import { TagRefParser } from './tagRefParser';

@Injectable()
export class RefParserService implements IRefParserService {
    public getRefParsers(): IRefParser[] {
        return [new HeadRefParser(), new RemoteHeadParser(), new TagRefParser()];
    }
}
