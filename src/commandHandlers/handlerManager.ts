import { Inject, Injectable } from 'container-ioc';
import { ICommandManager } from '../application/types/commandManager';
import { IDisposableRegistry } from '../application/types/disposableRegistry';
import { IServiceContainer } from '../ioc/types';
import { CommandHandlerRegister } from './registration';
import { ICommandHandler, ICommandHandlerManager } from './types';

@Injectable()
export class CommandHandlerManager implements ICommandHandlerManager {
    constructor( @Inject(IDisposableRegistry) private disposableRegistry: IDisposableRegistry,
        @Inject(ICommandManager) private commandManager: ICommandManager,
        @Inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public registerHandlers() {
        for (const item of CommandHandlerRegister.getHandlers()) {
            const serviceIdentifier = item[0];
            const handlers = item[1];
            const target = this.serviceContainer.get<ICommandHandler>(serviceIdentifier);
            handlers.forEach(handlerInfo => this.registerCommand(handlerInfo.commandName, handlerInfo.handlerMethodName, target));
        }
    }

    private registerCommand(commandName: string, handlerMethodName: string, target: ICommandHandler) {
        // tslint:disable-next-line:no-any
        const handler = target[handlerMethodName] as (...args: any[]) => void;
        // tslint:disable-next-line:no-any
        const disposable = this.commandManager.registerCommand(commandName, (...args: any[]) => {
            handler.apply(target, args);
        });
        this.disposableRegistry.register(disposable);
    }
}
