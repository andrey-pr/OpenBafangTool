import { PromiseControls } from '../../types/common';

export enum BesstPacketType {
    CAN_REQUEST = 0x15,
    CAN_RESPONSE = 0x12,
    BESST_HV = 0x30,
    BESST_SN = 0x31,
    BESST_SV = 0x32,
    BESST_ACTIVATE = 0x34,
    BESST_RESET = 0x39,
}

export const BesstActivationCode = [0x01, 0x01, 0x00, 0x00];

export type BesstWritePacket = {
    data: number[];
    interval: number;
    timeout: number;
    type: BesstPacketType;
    promise?: PromiseControls;
};
