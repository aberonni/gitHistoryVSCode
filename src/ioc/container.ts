import { Container, Injectable } from 'container-ioc';
import { IServiceContainer, ServiceIdentifier } from './types';

@Injectable()
export class ServiceContainer implements IServiceContainer {
    constructor(private container: Container) { }
    public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
        return this.container.resolve(serviceIdentifier);
    }
}
