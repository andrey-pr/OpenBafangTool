import { DeviceNetworkId } from '../device/besst/besst-types';

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
            DeviceNetworkId.DISPLAY,
        ],
    },
    Manufacturer: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x05,
        applicableDevices: [
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
        ],
    },
    ErrorCode: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x07,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    BootloaderVersion: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x08,
        applicableDevices: [DeviceNetworkId.DISPLAY],
    },
    Parameter1: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x11,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
    },
    Parameter2: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x12,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
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
    Parameter1: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x11,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
    },
    Parameter2: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x12,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
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
    MotorSpeedParameters: {
        canCommandCode: 0x32,
        canCommandSubCode: 0x03,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
    },
    CalibratePositionSensor: {
        canCommandCode: 0x62,
        canCommandSubCode: 0x00,
        applicableDevices: [DeviceNetworkId.DRIVE_UNIT],
    },
};

const ErrorCodes: {
    [key: number]: { description: string; recommendations: string };
} = {
    4: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    5: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    7: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    8: {
        description: 'Inner motor hall sensor (not speed hall sensor) error',
        recommendations: 'Check cable connection (for motorwheels), replace motor, try repair motor with disassembling if you are electronics specialist',
    },
    9: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    10: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    11: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    12: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    14: {
        description: 'Motor communication error',
        recommendations:
            'Check connection with motor. If its overheated, let it cool down. Check if motor has supply. Check contacts in connectors for dirt and damage.',
    },
    15: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    21: {
        description: 'Hall sensor error',
        recommendations:
            'Check magnet on wheel. Check connection with of hall sensor. Check hall sensor with multimeter. Try to connect spare sensor if available.',
    },
    25: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    26: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    27: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    30: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    33: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    35: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    36: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    37: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    41: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    42: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    43: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    45: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    46: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    47: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    48: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    71: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
    81: {
        description: 'Description for this code is not available', //TODO
        recommendations: '-',
    },
};
export function getErrorCodeText(code: number): {
    description: string;
    recommendations: string;
} {
    if (ErrorCodes[code]) return ErrorCodes[code];
    return {
        description: 'Unknown code',
        recommendations: '-',
    };
}
