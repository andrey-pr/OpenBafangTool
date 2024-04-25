import { BafangCanAssistLevel } from "../types/BafangCanSystemTypes";
import HID from 'node-hid';

export function filterHidDevices(devices: HID.Device[]): HID.Device[] {
    return devices.filter((device) => device.product === 'BaFang Besst');
}

export function hexMsgDecoder(msg: number[]) {
    return String.fromCharCode.apply(
        null,
        msg.slice(4, 4 + msg[3]).filter((value) => value != 0),
    );
}

export function decodeCurrentAssistLevel(
    currentAssistLevelCode: number,
    totalAssistLevels: number,
): BafangCanAssistLevel {
    let assistLevelTable: {
        [key: number]: { [key: number]: BafangCanAssistLevel };
    } = {
        3: { 0: 0, 12: 1, 2: 2, 3: 3, 6: 'walk' },
        4: { 0: 0, 1: 1, 12: 2, 21: 3, 3: 4, 6: 'walk' },
        5: { 0: 0, 11: 1, 13: 2, 21: 3, 23: 4, 3: 5, 6: 'walk' },
        9: {
            0: 0,
            1: 1,
            11: 2,
            12: 3,
            13: 4,
            2: 5,
            21: 6,
            22: 7,
            23: 8,
            3: 9,
            6: 'walk',
        },
    };
    if (
        (totalAssistLevels <= 3 || totalAssistLevels >= 5) &&
        totalAssistLevels != 9
    ) {
        totalAssistLevels = 5;
    }
    return assistLevelTable[totalAssistLevels][currentAssistLevelCode];
}