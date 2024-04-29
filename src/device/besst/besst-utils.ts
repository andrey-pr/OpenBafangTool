import { BesstCanResponsePacket, BesstRequestType } from './besst-types';

export function hexMsgDecoder(msg: number[]) {
    return String.fromCharCode.apply(
        null,
        msg.slice(4, 4 + msg[3]).filter((value) => value != 0),
    );
}

export function generateBesstRequestPacket(
    actionCode: number,
    cmd: number[],
    data: number[] = [0],
) {
    let msg = [0, actionCode || 0x15, 0, 0, ...cmd, data.length || 0, ...data];
    msg = [...msg, ...new Array(65 - msg.length).fill(0)];
    let interval;
    let timeout;
    switch (actionCode) {
        case BesstRequestType.BESST_HW:
        case BesstRequestType.BESST_SW:
        case BesstRequestType.BESST_SN:
            interval = 90;
            timeout = 200;
            break;
        case BesstRequestType.CAN_REQUEST:
            interval = 120;
            timeout = 1000;
            break;
        case BesstRequestType.BESST_RESET:
            interval = 5000;
            timeout = -1;
            break;
        case BesstRequestType.BESST_ACTIVATE:
            interval = 3000;
            timeout = -1;
            break;
        default:
            interval = 1000;
            timeout = -1;
            break;
    }
    return {
        data: msg,
        interval: interval,
        timeout: timeout,
        type: actionCode,
    };
}

export function buildBesstCanCommandPacket(
    source: number,
    target: number,
    canOperationCode: number,
    canCommandCode: number,
    canCommandSubCode: number,
    data: number[] = [0],
) {
    return generateBesstRequestPacket(
        BesstRequestType.CAN_REQUEST,
        [
            canCommandSubCode,
            canCommandCode,
            ((target & 0b11111) << 3) + (canOperationCode & 0b111),
            source & 0b11111,
        ],
        data,
    );
}

export function parseCanResponseFromBesst(
    array: number[],
): BesstCanResponsePacket[] {
    let packets: BesstCanResponsePacket[] = [];
    array = array.slice(3);
    while (array.length > 0) {
        if (array.slice(0, 13).filter((value) => value != 0).length !== 0) {
            packets.push({
                canCommandCode: array[1],
                canCommandSubCode: array[0],
                canOperationCode: array[2] & 0b0111,
                sourceDeviceCode: array[3] & 0b1111,
                targetDeviceCode: (array[2] & 0b01111000) >> 3,
                dataLength: array[4],
                data: array.slice(5, 5 + array[4]),
            });
        }
        array = array.slice(13);
    }

    return packets;
}
