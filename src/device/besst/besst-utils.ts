import { BesstReadedCanFrame, BesstPacketType, DeviceNetworkId } from './besst-types';

export function hexMsgDecoder(msg: number[]) {
    return String.fromCharCode.apply(
        null,
        msg.slice(4, 4 + msg[3]).filter((value) => value != 0),
    );
}

export function generateBesstWritePacket(
    actionCode: number,
    cmd: number[],
    resolve?: any,
    reject?: any,
    data: number[] = [0],
) {
    let msg = [0, actionCode || 0x15, 0, 0, ...cmd, data.length || 0, ...data];
    msg = [...msg, ...new Array(65 - msg.length).fill(0)];
    let interval;
    let timeout;
    switch (actionCode) {
        case BesstPacketType.BESST_HV:
        case BesstPacketType.BESST_SV:
        case BesstPacketType.BESST_SN:
            interval = 90;
            timeout = 200;
            break;
        case BesstPacketType.CAN_REQUEST:
            interval = 120;
            timeout = 1000;
            break;
        case BesstPacketType.BESST_RESET:
            interval = 5000;
            timeout = -1;
            break;
        case BesstPacketType.BESST_ACTIVATE:
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
        promise: resolve && reject ? { resolve, reject } : undefined,
    };
}

export function buildBesstCanCommandPacket(
    source: DeviceNetworkId,
    target: DeviceNetworkId,
    canOperationCode: number,
    canCommandCode: number,
    canCommandSubCode: number,
    resolve?: any,
    reject?: any,
    data: number[] = [0],
) {
    return generateBesstWritePacket(
        BesstPacketType.CAN_REQUEST,
        [
            canCommandSubCode,
            canCommandCode,
            ((target & 0b11111) << 3) + (canOperationCode & 0b111),
            source & 0b11111,
        ],
        resolve,
        reject,
        data,
    );
}

export function parseCanResponseFromBesst(
    array: number[],
): BesstReadedCanFrame[] {
    let packets: BesstReadedCanFrame[] = [];
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
