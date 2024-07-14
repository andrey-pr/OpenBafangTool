import HID from 'node-hid';
import { EventEmitter } from 'events';
import {
    CanOperation,
    DeviceNetworkId,
    ReadedCanFrame,
} from '../../types/BafangCanCommonTypes';
import IGenericCanAdapter from '../can/generic';
import { SerialPort } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';

export async function listCanableDevices(): Promise<string[]> {
    return (await SerialPort.list())
        .filter((port) => port.vendorId === 'ad50' && port.productId === '60c5')
        .map((port) => port.path);
}

class CanableDevice implements IGenericCanAdapter {
    private path: string;

    private device?: SerialPort<AutoDetectTypes>;

    public readonly emitter: EventEmitter;

    // private packetQueue: BesstWritePacket[] = [];

    private lastMultiframeCanResponse: {
        [key: number]: ReadedCanFrame;
    } = [];

    constructor(path: string) {
        this.path = path;
        // this.processReadedData = this.processReadedData.bind(this);
        // this.processWriteQueue = this.processWriteQueue.bind(this);
        // this.processCanFrame = this.processCanFrame.bind(this);
        this.connect = this.connect.bind(this);
        this.sendCanFrame = this.sendCanFrame.bind(this);
        this.sendCanFrameImmediately = this.sendCanFrameImmediately.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.emitter = new EventEmitter();
    }

    // private processWriteQueue(): void {
    //     if (this.packetQueue.length === 0) {
    //         setTimeout(this.processWriteQueue, 100);
    //         return;
    //     }
    //     const packet = this.packetQueue.shift() as BesstWritePacket;
    //     if (
    //         packet.type === BesstPacketType.CAN_REQUEST ||
    //         packet.type === BesstPacketType.BESST_ACTIVATE
    //     ) {
    //         packet.promise?.resolve();
    //     } else if (packet.type === BesstPacketType.BESST_HV) {
    //         setTimeout(() => {
    //             this.hardwareVersionPromise?.reject();
    //             this.hardwareVersionPromise = undefined;
    //         }, packet.timeout);
    //     } else if (packet.type === BesstPacketType.BESST_SV) {
    //         setTimeout(() => {
    //             this.softwareVersionPromise?.reject();
    //             this.softwareVersionPromise = undefined;
    //         }, packet.timeout);
    //     } else if (packet.type === BesstPacketType.BESST_SN) {
    //         setTimeout(() => {
    //             this.serialNumberPromise?.reject();
    //             this.serialNumberPromise = undefined;
    //         }, packet.timeout);
    //     }
    //     try {
    //         log.info('sent besst package:', packet.data);
    //         this.device?.write(packet.data);
    //     } catch (e) {
    //         console.log('write error:', e);
    //         this.onDisconnect();
    //     }
    //     setTimeout(this.processWriteQueue, packet.interval + 10);
    // }

    // private processReadedData(data: Uint8Array): void {
    //     if (data.length === 0) return;
    //     const array: number[] = [...data];
    //     switch (array[0]) {
    //         case 0x10:
    //         case 0x11:
    //             console.log('UART bike connected - its not supported');
    //             break;
    //         case BesstPacketType.CAN_RESPONSE:
    //             parseCanResponseFromBesst(array).forEach(this.processCanFrame);
    //             break;
    //         case BesstPacketType.BESST_HV:
    //             this.hardwareVersionPromise?.resolve(hexMsgDecoder(array));
    //             this.hardwareVersionPromise = undefined;
    //             break;
    //         case BesstPacketType.BESST_SN:
    //             this.serialNumberPromise?.resolve(hexMsgDecoder(array));
    //             this.serialNumberPromise = undefined;
    //             break;
    //         case BesstPacketType.BESST_SV:
    //             this.softwareVersionPromise?.resolve(hexMsgDecoder(array));
    //             this.softwareVersionPromise = undefined;
    //             break;
    //         case BesstPacketType.BESST_RESET:
    //         case BesstPacketType.BESST_ACTIVATE:
    //             break;
    //         default:
    //             console.log('Unknown message type - not supported yet');
    //             break;
    //     }
    // }

    // private processCanFrame(packet: ReadedCanFrame): void {
    //     if (packet.targetDeviceCode === DeviceNetworkId.BESST) {
    //         if (packet.canOperationCode === CanOperation.MULTIFRAME_START) {
    //             this.lastMultiframeCanResponse[packet.sourceDeviceCode] =
    //                 packet;
    //             this.lastMultiframeCanResponse[packet.sourceDeviceCode].data =
    //                 [];
    //             this.packetQueue.unshift(
    //                 buildBesstCanCommandPacket(
    //                     this.lastMultiframeCanResponse[packet.sourceDeviceCode]
    //                         .targetDeviceCode,
    //                     this.lastMultiframeCanResponse[packet.sourceDeviceCode]
    //                         .sourceDeviceCode,
    //                     CanOperation.NORMAL_ACK,
    //                     this.lastMultiframeCanResponse[packet.sourceDeviceCode]
    //                         .canCommandCode,
    //                     this.lastMultiframeCanResponse[packet.sourceDeviceCode]
    //                         .canCommandSubCode,
    //                 ),
    //             );
    //         } else if (packet.canOperationCode === CanOperation.MULTIFRAME) {
    //             if (this.lastMultiframeCanResponse[packet.sourceDeviceCode]) {
    //                 this.lastMultiframeCanResponse[
    //                     packet.sourceDeviceCode
    //                 ].data = [
    //                     ...this.lastMultiframeCanResponse[
    //                         packet.sourceDeviceCode
    //                     ].data,
    //                     ...packet.data,
    //                 ];
    //                 this.packetQueue.unshift(
    //                     buildBesstCanCommandPacket(
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].targetDeviceCode,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].sourceDeviceCode,
    //                         CanOperation.NORMAL_ACK,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].canCommandCode,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].canCommandSubCode,
    //                     ),
    //                 );
    //             }
    //         } else if (
    //             packet.canOperationCode === CanOperation.MULTIFRAME_END
    //         ) {
    //             if (this.lastMultiframeCanResponse[packet.sourceDeviceCode]) {
    //                 this.lastMultiframeCanResponse[
    //                     packet.sourceDeviceCode
    //                 ].data = [
    //                     ...this.lastMultiframeCanResponse[
    //                         packet.sourceDeviceCode
    //                     ].data,
    //                     ...packet.data,
    //                 ];
    //                 this.emitter.emit(
    //                     'can',
    //                     this.lastMultiframeCanResponse[packet.sourceDeviceCode],
    //                 );
    //                 this.packetQueue.unshift(
    //                     buildBesstCanCommandPacket(
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].targetDeviceCode,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].sourceDeviceCode,
    //                         CanOperation.NORMAL_ACK,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].canCommandCode,
    //                         this.lastMultiframeCanResponse[
    //                             packet.sourceDeviceCode
    //                         ].canCommandSubCode,
    //                     ),
    //                 );
    //                 delete this.lastMultiframeCanResponse[
    //                     packet.sourceDeviceCode
    //                 ];
    //             }
    //         } else if (packet.canOperationCode === CanOperation.NORMAL_ACK) {
    //             this.emitter.emit('can', packet);
    //         }
    //     } else if (packet.canOperationCode === CanOperation.WRITE_CMD) {
    //         this.emitter.emit('can', packet);
    //     } else {
    //         console.log('unknown command', packet);
    //     }
    // }

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.device = new SerialPort({
                path: this.path,
                baudRate: 921600,
                autoOpen: false,
            });
            this.device.open((error) => (error ? reject(error) : 0));
            this.device.on('open', resolve);
            // this.device.on('readable', this.processReadedData);
            // setTimeout(this.processWriteQueue, 100);
        });
    }

    public testConnection(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        });
    }

    public sendCanFrame(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data: number[] = [0],
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {});
    }

    public sendCanFrameImmediately(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data: number[] = [0],
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {});
    }

    public disconnect(): void {}
}

export default CanableDevice;
