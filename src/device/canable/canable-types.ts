import { PromiseControls } from '../../types/common';

export enum CanableCommands {
    OPEN = 0x11,
    CLOSE = 0x12,
    FRAME = 0x20,
    VERSION = 0xff,
}

export function getCanableCommandTimeout(command: CanableCommands): number {
    const TimeoutTable: { [key: number]: number } = {
        0x20: 1000,
        0xff: 100,
    };
    if (TimeoutTable[command]) return TimeoutTable[command];
    return 0;
}

export function getCanableCommandInterval(command: CanableCommands): number {
    const IntervalTable: { [key: number]: number } = {
        0x11: 50,
        0x12: 50,
        0x20: 120,
        0xff: 50,
    };
    if (IntervalTable[command]) return IntervalTable[command];
    return 0;
}

export type CanableWritePacket = {
    type: CanableCommands;
    frame?: {
        length: number;
        id: number[];
        data: number[];
    };
    promise?: PromiseControls;
};
