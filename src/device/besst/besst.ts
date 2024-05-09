import HID from 'node-hid';
import { EventEmitter } from 'stream';
import {
    buildBesstCanCommandPacket,
    generateBesstWritePacket,
    hexMsgDecoder,
    parseCanResponseFromBesst,
} from './besst-utils';
import {
    BesstWritePacket,
    BesstPacketType,
    BesstActivationCode,
    DeviceNetworkId,
    CanOperation,
    BesstReadedCanFrame,
} from './besst-types';

export function listBesstDevices(): HID.Device[] {
    return HID.devices().filter((device) => device.product === 'BaFang Besst');
}

class BesstDevice {
    private device?: HID.HID;

    public readonly emitter: EventEmitter;

    private serialNumberPromise?: {
        resolve: (...args: any[]) => void;
        reject: (...args: any[]) => void;
    } = undefined;

    private softwareVersionPromise?: {
        resolve: (...args: any[]) => void;
        reject: (...args: any[]) => void;
    } = undefined;

    private hardwareVersionPromise?: {
        resolve: (...args: any[]) => void;
        reject: (...args: any[]) => void;
    } = undefined;

    private packetQueue: BesstWritePacket[] = [];

    private lastMultiframeCanResponse: {
        [key: number]: BesstReadedCanFrame;
    } = [];

    constructor(path?: string, vid?: number, pid?: number) {
        if (!path && (!vid || !pid)) {
            throw new Error();
        }
        if (path) {
            this.device = new HID.HID(path);
        } else {
            this.device = new HID.HID(pid as number, vid as number);
        }
        this.processReadedData = this.processReadedData.bind(this);
        this.processWriteQueue = this.processWriteQueue.bind(this);
        this.processCanFrame = this.processCanFrame.bind(this);
        this.getSerialNumber = this.getSerialNumber.bind(this);
        this.getSoftwareVersion = this.getSoftwareVersion.bind(this);
        this.getHardwareVersion = this.getHardwareVersion.bind(this);
        this.sendCanFrame = this.sendCanFrame.bind(this);
        this.sendCanFrameImmediately = this.sendCanFrameImmediately.bind(this);
        this.reset = this.reset.bind(this);
        this.emitter = new EventEmitter();
        this.device?.addListener('data', this.processReadedData);
        setTimeout(this.processWriteQueue, 100);
    }

    private processWriteQueue(): void {
        if (this.packetQueue.length === 0) {
            setTimeout(this.processWriteQueue, 100);
            return;
        }
        const packet = this.packetQueue.shift() as BesstWritePacket;
        if (
            packet.type === BesstPacketType.CAN_REQUEST ||
            packet.type === BesstPacketType.BESST_ACTIVATE
        ) {
            packet.promise?.resolve();
        } else if (packet.type === BesstPacketType.BESST_HV) {
            setTimeout(() => {
                this.hardwareVersionPromise?.reject();
                this.hardwareVersionPromise = undefined;
            }, packet.timeout);
        } else if (packet.type === BesstPacketType.BESST_SV) {
            setTimeout(() => {
                this.softwareVersionPromise?.reject();
                this.softwareVersionPromise = undefined;
            }, packet.timeout);
        } else if (packet.type === BesstPacketType.BESST_SN) {
            setTimeout(() => {
                this.serialNumberPromise?.reject();
                this.serialNumberPromise = undefined;
            }, packet.timeout);
        }
        this.device?.write(packet.data);
        setTimeout(this.processWriteQueue, packet.interval + 10);
    }

    private processReadedData(data: Uint8Array): void {
        if (data.length === 0) return;
        const array: number[] = [...data];
        switch (array[0]) {
            case 0x10:
            case 0x11:
                console.log('UART bike connected - its not supported');
                break;
            case BesstPacketType.CAN_RESPONSE:
                parseCanResponseFromBesst(array).forEach(this.processCanFrame);
                break;
            case BesstPacketType.BESST_HV:
                this.hardwareVersionPromise?.resolve(hexMsgDecoder(array));
                this.hardwareVersionPromise = undefined;
                break;
            case BesstPacketType.BESST_SN:
                this.serialNumberPromise?.resolve(hexMsgDecoder(array));
                this.serialNumberPromise = undefined;
                break;
            case BesstPacketType.BESST_SV:
                this.softwareVersionPromise?.resolve(hexMsgDecoder(array));
                this.softwareVersionPromise = undefined;
                break;
            case BesstPacketType.BESST_RESET:
            case BesstPacketType.BESST_ACTIVATE:
                break;
            default:
                console.log('Unknown message type - not supported yet');
                break;
        }
    }

    private processCanFrame(packet: BesstReadedCanFrame): void {
        if (packet.targetDeviceCode === DeviceNetworkId.BESST) {
            if (packet.canOperationCode === CanOperation.MULTIFRAME_START) {
                this.lastMultiframeCanResponse[packet.sourceDeviceCode] =
                    packet;
                this.lastMultiframeCanResponse[packet.sourceDeviceCode].data =
                    [];
                this.packetQueue.unshift(
                    buildBesstCanCommandPacket(
                        this.lastMultiframeCanResponse[packet.sourceDeviceCode]
                            .targetDeviceCode,
                        this.lastMultiframeCanResponse[packet.sourceDeviceCode]
                            .sourceDeviceCode,
                        CanOperation.NORMAL_ACK,
                        this.lastMultiframeCanResponse[packet.sourceDeviceCode]
                            .canCommandCode,
                        this.lastMultiframeCanResponse[packet.sourceDeviceCode]
                            .canCommandSubCode,
                    ),
                );
            } else if (packet.canOperationCode === CanOperation.MULTIFRAME) {
                if (this.lastMultiframeCanResponse[packet.sourceDeviceCode]) {
                    this.lastMultiframeCanResponse[
                        packet.sourceDeviceCode
                    ].data = [
                        ...this.lastMultiframeCanResponse[
                            packet.sourceDeviceCode
                        ].data,
                        ...packet.data,
                    ];
                    this.packetQueue.unshift(
                        buildBesstCanCommandPacket(
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].targetDeviceCode,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].sourceDeviceCode,
                            CanOperation.NORMAL_ACK,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].canCommandCode,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].canCommandSubCode,
                        ),
                    );
                }
            } else if (
                packet.canOperationCode === CanOperation.MULTIFRAME_END
            ) {
                if (this.lastMultiframeCanResponse[packet.sourceDeviceCode]) {
                    this.lastMultiframeCanResponse[
                        packet.sourceDeviceCode
                    ].data = [
                        ...this.lastMultiframeCanResponse[
                            packet.sourceDeviceCode
                        ].data,
                        ...packet.data,
                    ];
                    this.emitter.emit(
                        'can',
                        this.lastMultiframeCanResponse[packet.sourceDeviceCode],
                    );
                    this.packetQueue.unshift(
                        buildBesstCanCommandPacket(
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].targetDeviceCode,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].sourceDeviceCode,
                            CanOperation.NORMAL_ACK,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].canCommandCode,
                            this.lastMultiframeCanResponse[
                                packet.sourceDeviceCode
                            ].canCommandSubCode,
                        ),
                    );
                    delete this.lastMultiframeCanResponse[
                        packet.sourceDeviceCode
                    ];
                }
            } else if (packet.canOperationCode === CanOperation.NORMAL_ACK) {
                this.emitter.emit('can', packet);
            }
        } else if (packet.canOperationCode === CanOperation.WRITE_CMD) {
            this.emitter.emit('can', packet);
        } else {
            console.log('unknown command');
        }
    }

    public getSerialNumber(): Promise<string> {
        this.packetQueue.push(
            generateBesstWritePacket(BesstPacketType.BESST_SN, [0, 0, 0, 0]),
        );
        return new Promise<string>((resolve, reject) => {
            this.serialNumberPromise = { resolve, reject };
        });
    }

    public getSoftwareVersion(): Promise<string> {
        this.packetQueue.push(
            generateBesstWritePacket(BesstPacketType.BESST_SV, [0, 0, 0, 0]),
        );
        return new Promise<string>((resolve, reject) => {
            this.softwareVersionPromise = { resolve, reject };
        });
    }

    public getHardwareVersion(): Promise<string> {
        this.packetQueue.push(
            generateBesstWritePacket(BesstPacketType.BESST_HV, [0, 0, 0, 0]),
        );
        return new Promise<string>((resolve, reject) => {
            this.hardwareVersionPromise = { resolve, reject };
        });
    }

    public reset(): Promise<void> {
        const vid = this.device?.getDeviceInfo().vendorId; // its okay. There is mistake in node-hid's class type file, actually this function exists
        const pid = this.device?.getDeviceInfo().productId;
        this.device?.removeAllListeners();
        this.packetQueue = [];
        this.packetQueue.push(
            generateBesstWritePacket(BesstPacketType.BESST_RESET, [0, 0, 0, 0]),
        );
        return new Promise<void>(async (resolve) => {
            setTimeout(() => {
                this.device = new HID.HID(vid, pid);
                this.device.addListener('data', this.processReadedData);
                resolve();
            }, 4500);
        });
    }

    public activateDriveUnit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.packetQueue.push(
                generateBesstWritePacket(
                    BesstPacketType.BESST_ACTIVATE,
                    BesstActivationCode,
                    resolve,
                    reject,
                ),
            );
        });
    }

    public sendCanFrame(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data = [0],
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.packetQueue.push(
                buildBesstCanCommandPacket(
                    source,
                    target,
                    canOperationCode,
                    canCommandCode,
                    canCommandSubCode,
                    resolve,
                    reject,
                    data,
                ),
            );
        });
    }

    public sendCanFrameImmediately(
        source: DeviceNetworkId,
        target: DeviceNetworkId,
        canOperationCode: CanOperation,
        canCommandCode: number,
        canCommandSubCode: number,
        data = [0],
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.packetQueue.unshift(
                buildBesstCanCommandPacket(
                    source,
                    target,
                    canOperationCode,
                    canCommandCode,
                    canCommandSubCode,
                    resolve,
                    reject,
                    data,
                ),
            );
        });
    }

    public disconnect(): void {
        this.device?.removeAllListeners();
        this.device = undefined;
    }
}

export default BesstDevice;
