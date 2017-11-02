import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { EventEmitter } from 'events';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { decorate, inject, injectable } from 'inversify';
import * as path from 'path';
import { IGitServiceFactory } from '../types';
import { ApiController } from './apiController';
import { IServerHost, IWorkspaceQueryStateStore, IThemeService, StartupInfo } from './types';

// inversify requires inherited classes to be decorated with @injectable()
// This is a workaround forat that requirement
decorate(injectable(), EventEmitter);

@injectable()
export class ServerHost extends EventEmitter implements IServerHost {
    private app?: Express;
    private httpServer?: http.Server;
    constructor( @inject(IThemeService) private themeService: IThemeService,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IWorkspaceQueryStateStore) private stateStore: IWorkspaceQueryStateStore) {
        super();
    }

    public dispose() {
        this.app = undefined;
        this.port = undefined;
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = undefined;
        }
        if (this.apiController) {
            this.apiController.dispose();
        }
    }

    private port?: number;
    private startPromise: Promise<StartupInfo>;
    public async start(workspaceFolder: string): Promise<StartupInfo> {
        if (this.startPromise) {
            return this.startPromise;
        }

        this.app = express();
        // tslint:disable-next-line:no-any
        this.httpServer = http.createServer(this.app as any);

        const rootDirectory = path.join(__dirname, '..', '..', 'browser');
        const node_modulesDirectory = path.join(__dirname, '..', '..', '..', 'node_modules');
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(express.static(rootDirectory));
        this.app.use(express.static(path.join(__dirname, '..', '..', '..', 'resources'), { extensions: ['.svg', 'svg', 'json', '.json'] }));
        // this.app.use(express.static(path.join(__dirname, '..', '..'), { extensions: ['.svg', 'svg', 'json', '.json'] }));
        this.app.use(express.static(path.join(node_modulesDirectory, 'octicons', 'build')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'hint.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'animate.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'normalize.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'bootstrap', 'dist', 'css')));
        this.app.use(cors());
        this.app.get('/', (req, res, next) => {
            this.rootRequestHandler(req, res);
        });

        return this.startPromise = new Promise<StartupInfo>((resolve, reject) => {
            this.apiController = new ApiController(this.app!, this.gitServiceFactory, this.stateStore);
            this.httpServer!.listen(0, () => {
                this.port = this.httpServer!.address().port;
                resolve({ port: this.port });
            });
            this.httpServer!.on('error', error => {
                if (!this.port) {
                    reject(error);
                }
            });
        });
    }
    private apiController: ApiController;
    public rootRequestHandler(req: Request, res: Response) {
        const theme: string = req.query.theme;
        const backgroundColor: string = req.query.backgroundColor;
        const color: string = req.query.color;
        const themeDetails = this.themeService.getThemeDetails(theme, backgroundColor, color);
        res.render(path.join(__dirname, '..', '..', 'browser', 'index.ejs'), themeDetails);
    }
}
