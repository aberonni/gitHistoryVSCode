import { Container, LifeTime } from 'container-ioc';
import { Abstract, IServiceContainer, IServiceManager, Newable } from '../src/ioc/types';

export class TestServiceContainer implements IServiceContainer, IServiceManager {
    private container: Container;
    constructor() {
        this.container = new Container();
    }
    // tslint:disable-next-line:no-any
    public add<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T): void {
        this.container.register({ token: serviceIdentifier, useClass: constructor, lifeTime: LifeTime.PerRequest });
    }
    // tslint:disable-next-line:no-any
    public addSingleton<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, constructor: new (...args: any[]) => T): void {
        this.container.register({ token: serviceIdentifier, useClass: constructor, lifeTime: LifeTime.Persistent });
    }
    public addSingletonInstance<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>, instance: T): void {
        this.container.register({ token: serviceIdentifier, useValue: instance, lifeTime: LifeTime.Persistent });
    }
    // tslint:disable-next-line:no-any
    public get<T>(serviceIdentifier: string | symbol | Newable<T> | Abstract<T>): T {
        return this.container.resolve(serviceIdentifier);
    }
}
