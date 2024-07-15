import {
    CanOperation,
    DeviceNetworkId,
} from '../../types/BafangCanCommonTypes';
import { PromiseControls } from '../../types/common';
import { CanFrame } from '../can/can-types';
import { BesstPacketType } from './besst-types';

export function hexMsgDecoder(msg: number[]) {
    return String.fromCharCode.apply(
        null,
        msg.slice(4, 4 + msg[3]).filter((value) => value !== 0),
    );
}

export function generateBesstWritePacket(
    actionCode: BesstPacketType,
    cmd: number[],
    promise?: PromiseControls,
    data: number[] = [0],
) {
    let msg = [0, actionCode, 0, 0, ...cmd, data.length || 0, ...data];
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
        interval,
        timeout,
        type: actionCode,
        promise,
    };
}

// export function buildBesstCanCommandPacket(
//     source: DeviceNetworkId,
//     target: DeviceNetworkId,
//     canOperationCode: CanOperation,
//     canCommandCode: number,
//     canCommandSubCode: number,
//     promise?: PromiseControls,
//     data: number[] = [0],
// ) {
//     return generateBesstWritePacket(
//         BesstPacketType.CAN_REQUEST,
//         [
//             canCommandSubCode,
//             canCommandCode,
//             ((target & 0b11111) << 3) + (canOperationCode & 0b111),
//             source & 0b11111,
//         ],
//         promise,
//         data,
//     );
// }

export function parseCanResponseFromBesst(array: number[]): CanFrame[] {
    const packets: CanFrame[] = [];
    array = array.slice(3);
    console.log('raw data from besst', array)
    while (array.length > 0) {
        if (array.slice(0, 13).filter((value) => value !== 0).length !== 0) {
            packets.push({
                id: array.slice(0, 4).reverse(),
                data: array.slice(5, 5 + array[4]),
            });
        }
        array = array.slice(13);
    }
    console.log('parsed data from besst', packets)

    return packets;
}
