import { EventEmitter } from 'events';
import {
    CanOperation,
    DeviceNetworkId,
    ReadedCanFrame,
} from '../../types/BafangCanCommonTypes';
import IGenericCanAdapter from '../can/generic';
import { SerialPort } from 'serialport';
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { PromiseControls } from '../../types/common';

export async function listCanableDevices(): Promise<string[]> {
    return (await SerialPort.list())
        .filter((port) => port.vendorId === 'ad50' && port.productId === '60c5')
        .map((port) => port.path);
}

class CanableDevice implements IGenericCanAdapter {
    private path: string;

    private device?: SerialPort<AutoDetectTypes>;

    public readonly emitter: EventEmitter;

    private serialReadBuffer: number[] = [];

    private versionPromise?: PromiseControls;

    // private packetQueue: BesstWritePacket[] = [];

    private lastMultiframeCanResponse: {
        [key: number]: ReadedCanFrame;
    } = [];

    constructor(path: string) {
        this.path = path;
        this.processReadedData = this.processReadedData.bind(this);
        // this.processWriteQueue = this.processWriteQueue.bind(this);
        // this.processCanFrame = this.processCanFrame.bind(this);
        this.connect = this.connect.bind(this);
        this.sendCanFrame = this.sendCanFrame.bind(this);
        this.sendCanFrameImmediately = this.sendCanFrameImmediately.bind(this);
        this.getVersion = this.getVersion.bind(this);
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

    private processReadedData(data: Uint8Array): void {
        this.serialReadBuffer = [...this.serialReadBuffer, ...data];
        if (this.serialReadBuffer.indexOf(0x0a) === -1) return;
        let cmd = this.serialReadBuffer.splice(
            0,
            this.serialReadBuffer.indexOf(0x0a) + 1,
        );
        let cmdData = cmd.slice(1, cmd.length - 1).map((byte) => byte - 0x30);
        console.log('Raw cmd:', cmd);
        switch (cmd[0]) {
            case 0x20:
                let length = cmdData[0];
                let frame_id: number[] = [
                    (cmdData[1] << 4) + cmdData[2],
                    (cmdData[3] << 4) + cmdData[4],
                    (cmdData[5] << 4) + cmdData[6],
                    (cmdData[7] << 4) + cmdData[8],
                ];
                let frame_data: number[] = [];
                cmdData.slice(9, cmdData.length).forEach((value, index) => {
                    index % 2 == 0
                        ? frame_data.push(value)
                        : (frame_data[frame_data.length - 1] =
                              (frame_data[frame_data.length - 1] << 4) + value);
                });
                if (frame_data.length !== length) {
                    console.log('Error (length)');
                    break;
                }
                console.log('Got frame:', length, frame_id, frame_data);
                break;
            case 0x40:
                console.log('Error');
                break;
            case 0xff:
                if (cmdData.length !== 6) this.versionPromise?.reject();
                let version: number[] = [
                    (cmdData[0] << 4) + cmdData[1],
                    (cmdData[2] << 4) + cmdData[3],
                    (cmdData[4] << 4) + cmdData[5],
                ];
                this.versionPromise?.resolve(version);
                this.versionPromise = undefined;
                break;
            default:
                break;
        }
    }

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

    public async connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.device = new SerialPort({
                path: this.path,
                baudRate: 921600,
                autoOpen: false,
            });
            this.device.on('readable', () =>
                this.processReadedData(this.device?.read()),
            );
            this.device.on('open', () => {
                this.device?.write([0x11, 0x0a]);
                resolve();
            });
            this.device.open((error) => (error ? reject(error) : 0));
            // setTimeout(this.processWriteQueue, 100);
        });
    }

    public getVersion(): Promise<number[]> {
        this.device?.write([0xff, 0x0a]);
        return new Promise<number[]>((resolve, reject) => {
            this.versionPromise = { resolve, reject };
        });
    }

    public testConnection(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            if (!this.device) await this.connect();
            this.getVersion()
                .then((version) => {
                    console.log(version);
                    resolve(true);
                })
                .catch(reject);
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
