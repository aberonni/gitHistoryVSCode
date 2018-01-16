import { IServiceManager } from '../ioc/types';
import { NodeFactoryService } from './factory';
import { INodeFactoryService } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    // serviceManager.addSingleton<INodeFactory>(INodeFactory, StandardNodeFactory, 'standard');
    // serviceManager.addSingleton<INodeFactory>(INodeFactory, ComparisonNodeFactory, 'comparison');
    serviceManager.addSingleton<INodeFactoryService>(INodeFactoryService, NodeFactoryService);
}
