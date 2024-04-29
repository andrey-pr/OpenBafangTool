import { DeviceNetworkId } from "../device/besst/besst-types";

export type CanCommand = {
    canCommandCode: number;
    canCommandSubCode: number;
    applicableDevices: DeviceNetworkId[];
};

export const CanReadCommandsList: {
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
    MotorSpeedParameters: {
        canCommandCode: 0x32,
        canCommandSubCode: 0x03,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
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
};

export const CanWriteCommandsList: {
    [key: string]: CanCommand;
} = {
    SerialNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x03,
        applicableDevices: [
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.TORQUE_SENSOR,
        ],
    },
    CustomerNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x04,
        applicableDevices: [
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.TORQUE_SENSOR,
        ],
    },
    Manufacturer: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x05,
        applicableDevices: [
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.TORQUE_SENSOR,
        ],
    },
    DisplayTotalMileage: {
        canCommandCode: 0x62,
        canCommandSubCode: 0x01,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    DisplayTime: {
        canCommandCode: 0x62,
        canCommandSubCode: 0x02,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    DisplaySingleMileage: {
        canCommandCode: 0x62,
        canCommandSubCode: 0x03,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    CleanServiceMileage: {
        canCommandCode: 0x63,
        canCommandSubCode: 0x02,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
};
