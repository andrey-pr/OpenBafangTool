import HID from 'node-hid';
import { generateBesstRequestPacket, hexMsgDecoder, parseCanResponseFromBesst } from './besst-utils';
import { BesstRequestType } from './besst-types';
import { EventEmitter } from 'stream';

export function listBesstDevices(): HID.Device[] {
    return HID.devices().filter((device) => device.product === 'BaFang Besst');
}

class BesstDevice {
    private device?: HID.HID;
    public readonly emitter: EventEmitter;
    constructor(path?: string, vid?: number, pid?: number) {
        if (!path && (!vid || !pid)) {
            throw new Error();
        }
        if (path) {
            this.device = new HID.HID(path);
        } else {
            this.device = new HID.HID(pid as number, vid as number);
        }
        this.device?.addListener('data', this.processReadedData);
        this.emitter = new EventEmitter();
    }

    private processReadedData(data: Uint8Array): void {
        if (data.length === 0) return;
        let array: number[] = [...data];
        switch (array[0]) {
            case 0x10:
            case 0x11:
                console.log('UART bike connected - its not supported');
                break;
            case BesstRequestType.CAN_RESPONSE:
                parseCanResponseFromBesst(array).forEach(console.log);
                break;
            case BesstRequestType.BESST_HW:
                console.log('HW:', hexMsgDecoder(array));
                break;
            case BesstRequestType.BESST_SN:
                console.log('SN:', hexMsgDecoder(array));
                break;
            case BesstRequestType.BESST_SW:
                console.log('SW:', hexMsgDecoder(array));
                break;
            case BesstRequestType.BESST_RESET:
            case BesstRequestType.BESST_ACTIVATE:
                break;
            default:
                console.log('Unknown message type - not supperted yet');
                break;
        }
    }

    public serialNumber(): void {
        this.device?.write(
            generateBesstRequestPacket(BesstRequestType.BESST_SN, [0, 0, 0, 0])
                .data,
        );
    }

    public softwareVersion(): void {
        this.device?.write(
            generateBesstRequestPacket(BesstRequestType.BESST_SW, [0, 0, 0, 0])
                .data,
        );
    }

    public hardwareVersion(): void {
        this.device?.write(
            generateBesstRequestPacket(BesstRequestType.BESST_HW, [0, 0, 0, 0])
                .data,
        );
    }

    public disconnect(): void {
        this.device?.removeAllListeners();
        this.device = undefined;
    }
}
