import { Disposable } from 'vscode';
import { ServiceIdentifier } from '../ioc/types';
import { ICommandHandler } from './types';

// tslint:disable-next-line:no-any
type CommandHandler = (...args: any[]) => any;
type CommandHandlerInfo = { commandName: string; handlerMethodName: string };

// tslint:disable-next-line:no-stateless-class
export class CommandHandlerRegister implements Disposable {
    private static Handlers = new Map<ServiceIdentifier<ICommandHandler>, CommandHandlerInfo[]>();
    public static register(commandName: string, handlerMethodName: string, serviceIdentifier: ServiceIdentifier<ICommandHandler>) {
        if (!CommandHandlerRegister.Handlers.has(serviceIdentifier)) {
            CommandHandlerRegister.Handlers.set(serviceIdentifier, []);
        }
        const commandList = CommandHandlerRegister.Handlers.get(serviceIdentifier)!;
        commandList.push({ commandName, handlerMethodName });
        CommandHandlerRegister.Handlers.set(serviceIdentifier, commandList);
    }
    public static getHandlers(): IterableIterator<[ServiceIdentifier<ICommandHandler>, CommandHandlerInfo[]]> {
        return CommandHandlerRegister.Handlers.entries();
    }
    public dispose() {
        CommandHandlerRegister.Handlers.clear();
    }
}

// tslint:disable-next-line:no-any function-name
export function command(commandName: string, serviceIdentifier: ServiceIdentifier<ICommandHandler>) {
    // tslint:disable-next-line:no-function-expression
    return function (_target: ICommandHandler, propertyKey: string, descriptor: TypedPropertyDescriptor<CommandHandler>) {
        CommandHandlerRegister.register(commandName, propertyKey, serviceIdentifier);
        return descriptor;
    };
}
