import { Container } from 'container-ioc';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { registerTypes as registerParserTypes } from './adapter/parsers/serviceRegistry';
import { registerTypes as registerRepositoryTypes } from './adapter/repository/serviceRegistry';
import { registerTypes as registerAdapterTypes } from './adapter/serviceRegistry';
import { registerTypes as registerApplicationTypes } from './application/serviceRegistry';
import { ICommandManager } from './application/types/commandManager';
import { IDisposableRegistry } from './application/types/disposableRegistry';
import { registerTypes as registerCommandFactoryTypes } from './commandFactories/serviceRegistry';
import { registerTypes as registerCommandTypes } from './commandHandlers/serviceRegistry';
import { ILogService, IUiService } from './common/types';
import { OutputPanelLogger } from './common/uiLogger';
import { UiService } from './common/uiService';
import { gitHistoryFileViewerSchema, gitHistorySchema } from './constants';
import { CommitViewFormatter } from './formatters/commitFormatter';
import { ICommitViewFormatter } from './formatters/types';
import { ServiceContainer } from './ioc/container';
import { setServiceContainer } from './ioc/index';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { getLogChannel } from './logger';
import { registerTypes as registerNodeBuilderTypes } from './nodes/serviceRegistry';
import { registerTypes as registerPlatformTypes } from './platform/serviceRegistry';
import { ContentProvider } from './server/contentProvider';
import { ServerHost } from './server/serverHost';
import { StateStore } from './server/stateStore';
import { ThemeService } from './server/themeService';
import { IServerHost, IThemeService, IWorkspaceQueryStateStore } from './server/types';
import { IGitServiceFactory, IOutputChannel } from './types';
import { CommitFileViewerProvider } from './viewers/file/commitFileViewer';
import { registerTypes as registerViewerTypes } from './viewers/serviceRegistry';

let cont: Container;
let serviceManager: ServiceManager;
let serviceContainer: ServiceContainer;

// tslint:disable-next-line:no-any
export async function activate(context: vscode.ExtensionContext): Promise<any> {
    cont = new Container();
    serviceManager = new ServiceManager(cont);
    serviceContainer = new ServiceContainer(cont);

    serviceManager.addSingletonInstance<IServiceContainer>(IServiceContainer, serviceContainer);

    serviceManager.addSingleton<ILogService>(ILogService, OutputPanelLogger);
    serviceManager.addSingleton<IUiService>(IUiService, UiService);
    serviceManager.addSingleton<IThemeService>(IThemeService, ThemeService);
    serviceManager.addSingleton<ICommitViewFormatter>(ICommitViewFormatter, CommitViewFormatter);
    serviceManager.addSingleton<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore, StateStore);
    serviceManager.addSingletonInstance<OutputChannel>(IOutputChannel, getLogChannel());
    // cont.bind<FileStatParser>(FileStatParser).to(FileStatParser);

    registerParserTypes(serviceManager);
    registerRepositoryTypes(serviceManager);
    registerAdapterTypes(serviceManager);
    registerApplicationTypes(serviceManager);
    registerPlatformTypes(serviceManager);
    registerCommandFactoryTypes(serviceManager);
    registerNodeBuilderTypes(serviceManager);
    registerViewerTypes(serviceManager);
    setServiceContainer(serviceContainer);

    const themeService = serviceContainer.get<IThemeService>(IThemeService);
    const gitServiceFactory = serviceContainer.get<IGitServiceFactory>(IGitServiceFactory);
    const workspaceQuerySessionStore = serviceContainer.get<IWorkspaceQueryStateStore>(IWorkspaceQueryStateStore);
    serviceManager.addSingletonInstance(IServerHost, new ServerHost(themeService, gitServiceFactory, serviceContainer, workspaceQuerySessionStore));

    // Register last.
    registerCommandTypes(serviceManager);

    let disposable = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, new ContentProvider());
    context.subscriptions.push(disposable);

    disposable = vscode.workspace.registerTextDocumentContentProvider(gitHistoryFileViewerSchema, new CommitFileViewerProvider(serviceContainer));
    context.subscriptions.push(disposable);
    context.subscriptions.push(serviceContainer.get<IDisposableRegistry>(IDisposableRegistry));

    const commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    commandManager.executeCommand('setContext', 'git.commit.view.show', true);

    // fileHistory.activate(context);
    // lineHistory.activate(context);
    // searchHistory.activate(context);
    // commitViewer.activate(context, logViewer.getGitRepoPath);
    // logViewer.activate(context);
    // commitComparer.activate(context, logViewer.getGitRepoPath);
}
