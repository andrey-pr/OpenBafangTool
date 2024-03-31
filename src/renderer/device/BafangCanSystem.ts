/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { DeviceName } from '../models/DeviceType';
import IConnection from './Connection';

export default class BafangCanSystem implements IConnection {
    private port: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    public emitter: EventEmitter;

    private unsubscribe: (() => void) | undefined = undefined;

    private portBuffer: Uint8Array = new Uint8Array();

    constructor(port: string) {
        this.port = port;
        this.emitter = new EventEmitter();
        this.loadData = this.loadData.bind(this);
    }

    connect(): Promise<boolean> {
        if (this.port === 'simulator') {
            console.log('Simulator connected');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    disconnect(): void {
        if (this.port === 'simulator') {
            console.log('Simulator disconnected');
        }
        if (this.unsubscribe !== undefined) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    testConnection(): Promise<boolean> {
        if (this.port === 'simulator') {
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        return this.connect()
            .then((value) => {
                // TODO add test package send
                this.disconnect();
                return value;
            })
            .catch(() => {
                return false;
            });
    }

    loadData(): void {
        if (this.port === 'simulator') {
            setTimeout(() => this.emitter.emit('data'), 300);
            console.log('Simulator: blank data loaded');
        }
    }

    saveData(): boolean {
        if (this.port === 'simulator') {
            return true;
        }
        return false;
    }
}
