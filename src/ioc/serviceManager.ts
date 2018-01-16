import { Container, LifeTime } from 'container-ioc';
import { IServiceManager, ServiceIdentifier } from './types';
export class ServiceManager implements IServiceManager {
    constructor(private container: Container) { }
    // tslint:disable-next-line:no-any
    public add<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: new (...args: any[]) => T): void {
        this.container.register({ token: serviceIdentifier, useClass: constructor, lifeTime: LifeTime.PerRequest });
    }
    // tslint:disable-next-line:no-any
    public addSingleton<T>(serviceIdentifier: ServiceIdentifier<T>, constructor: new (...args: any[]) => T): void {
        this.container.register({ token: serviceIdentifier, useClass: constructor, lifeTime: LifeTime.Persistent });
    }
    public addSingletonInstance<T>(serviceIdentifier: ServiceIdentifier<T>, instance: T): void {
        this.container.register({ token: serviceIdentifier, useValue: instance, lifeTime: LifeTime.Persistent });
    }
    public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
        return this.container.resolve(serviceIdentifier);
    }
}
