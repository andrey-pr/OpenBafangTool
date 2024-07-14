import EventEmitter from 'events';
import {
    CanOperation,
    DeviceNetworkId,
} from '../../types/BafangCanCommonTypes';

export default interface IGenericCanAdapter {
    emitter: EventEmitter; // TODO
    sendCanFrame(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data?: number[],
    ): Promise<void>;
    sendCanFrameImmediately(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data?: number[],
    ): Promise<void>;
    disconnect(): void;
}
