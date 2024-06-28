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

export enum CanOperation {
    WRITE_CMD = 0x00,
    READ_CMD = 0x01,
    NORMAL_ACK = 0x02,
    ERROR_ACK = 0x03,
    MULTIFRAME_START = 0x04,
    MULTIFRAME = 0x05,
    MULTIFRAME_END = 0x06,
    MULTIFRAME_WARNING = 0x07,
}

export enum DeviceNetworkId {
    TORQUE_SENSOR = 0x01,
    DRIVE_UNIT = 0x02,
    DISPLAY = 0x03,
    BATTERY = 0x04,
    BESST = 0x05,
    BROADCAST = 0x1f,
}

export type BesstReadedCanFrame = {
    canCommandCode: number;
    canCommandSubCode: number;
    canOperationCode: CanOperation;
    sourceDeviceCode: DeviceNetworkId;
    targetDeviceCode: DeviceNetworkId;
    dataLength: number;
    data: number[];
};

export type BesstWritePacket = {
    data: number[];
    interval: number;
    timeout: number;
    type: BesstPacketType;
    promise?: PromiseControls;
};
