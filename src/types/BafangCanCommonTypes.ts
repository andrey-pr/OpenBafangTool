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

export type ReadedCanFrame = {
    canCommandCode: number;
    canCommandSubCode: number;
    canOperationCode: CanOperation;
    sourceDeviceCode: DeviceNetworkId;
    targetDeviceCode: DeviceNetworkId;
    dataLength: number;
    data: number[];
};