import { EventEmitter } from 'events';
import DeviceType from '../models/DeviceType';

export default interface IConnection {
    connect(): Promise<boolean>;
    disconnect(): void;
    testConnection(): Promise<boolean>;
    deviceType: DeviceType;
    loadData(): void;
    emitter: EventEmitter;
    saveData(): boolean;
}
