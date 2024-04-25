export enum BesstRequestType {
    CAN_REQUEST = 0x15,
    CAN_RESPONSE = 0x12,
    BESST_HW = 0x30,
    BESST_SN = 0x31,
    BESST_SW = 0x32,
    BESST_RESET = 0x39,
}

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

type CanCommand = {
    canCommandCode: number;
    canCommandSubCode: number;
    applicableDevices: DeviceNetworkId[];
};

export const CanCommandsList: {
    [key: string]: CanCommand;
} = {
    HardwareVersion: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x00,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    SoftwareVersion: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x01,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    ModelNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x02,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    SerialNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x03,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    CustomerNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x04,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    Manufacturer: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x05,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    BootloaderVersion: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x08,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    DisplayDataBlock1: {
        canCommandCode: 0x63,
        canCommandSubCode: 0x01,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    DisplayDataBlock2: {
        canCommandCode: 0x63,
        canCommandSubCode: 0x02,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    CleanServiceMileage: {
        canCommandCode: 0x63,
        canCommandSubCode: 0x02,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
};
