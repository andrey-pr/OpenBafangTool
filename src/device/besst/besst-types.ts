export enum BesstRequestType {
    CAN_REQUEST = 0x15,
    CAN_RESPONSE = 0x12,
    BESST_HW = 0x30,
    BESST_SN = 0x31,
    BESST_SW = 0x32,
    BESST_ACTIVATE = 0x34,
    BESST_RESET = 0x39,
}

export const BesstActivationCode = [0x01, 0x01, 0x00, 0x00];

export enum CanOperation {
    WRITE_CMD = 0x00,
    READ_CMD = 0x01,
    NORMAL_ACK = 0x02,
    ERROR_ACK = 0x03,
    LONG_START_CMD = 0x04,
    LONG_TRANG_CMD = 0x05,
    LONG_END_CMD = 0x06,
    LONG_WARNING_CMD = 0x07,
}

export enum DeviceNetworkId {
    TORQUE_SENSOR = 0x01,
    DRIVE_UNIT = 0x02,
    DISPLAY = 0x03,
    BESST = 0x05,
    BROADCAST = 0x1f,
}

export type BesstCanResponsePacket = {
    canCommandCode: number;
    canCommandSubCode: number;
    canOperationCode: CanOperation;
    sourceDeviceCode: DeviceNetworkId;
    targetDeviceCode: DeviceNetworkId;
    dataLength: number;
    data: number[];
};