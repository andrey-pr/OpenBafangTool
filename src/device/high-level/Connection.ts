import { EventEmitter } from 'events';
import { DeviceName } from '../../types/DeviceType';

export default interface IConnection {
    connect(): Promise<boolean>;
    disconnect(): void;
    testConnection(): Promise<boolean>;
    deviceName: DeviceName;
    loadData(): void;
    emitter: EventEmitter;
    saveData(): boolean;
}
