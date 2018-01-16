import { Injectable } from 'container-ioc';
import { Disposable } from 'vscode';
import { IDisposableRegistry } from './types/disposableRegistry';

@Injectable()
export class DisposableRegistry implements IDisposableRegistry {
    private disposables: Disposable[] = [];
    public register(disposable: Disposable): void {
        this.disposables.push(disposable);
    }
    public dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
    }
}
