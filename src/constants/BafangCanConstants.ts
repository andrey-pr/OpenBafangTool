import { DeviceNetworkId } from '../device/besst/besst-types';
import { Wheel } from '../types/BafangCanSystemTypes';

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
            DeviceNetworkId.BATTERY,
        ],
    },
    SoftwareVersion: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x01,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.BATTERY,
        ],
    },
    ModelNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x02,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.BATTERY,
        ],
    },
    SerialNumber: {
        canCommandCode: 0x60,
        canCommandSubCode: 0x03,
        applicableDevices: [
            DeviceNetworkId.TORQUE_SENSOR,
            DeviceNetworkId.DRIVE_UNIT,
            DeviceNetworkId.DISPLAY,
            DeviceNetworkId.BATTERY,
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
    CellsVoltage0: {
        canCommandCode: 0x64,
        canCommandSubCode: 0x02,
        applicableDevices: [DeviceNetworkId.BATTERY],
    },
    CellsVoltage1: {
        canCommandCode: 0x64,
        canCommandSubCode: 0x03,
        applicableDevices: [DeviceNetworkId.BATTERY],
    },
    CellsVoltage2: {
        canCommandCode: 0x64,
        canCommandSubCode: 0x04,
        applicableDevices: [DeviceNetworkId.BATTERY],
    },
    CellsVoltage3: {
        canCommandCode: 0x64,
        canCommandSubCode: 0x05,
        applicableDevices: [DeviceNetworkId.BATTERY],
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

export const WheelDiameterTable: Wheel[] = [
    {
        text: '6″',
        minimalCircumference: 400,
        maximalCircumference: 880,
        code: [0x60, 0x00],
    },
    {
        text: '7″',
        minimalCircumference: 520,
        maximalCircumference: 880,
        code: [0x70, 0x00],
    },
    {
        text: '8″',
        minimalCircumference: 520,
        maximalCircumference: 880,
        code: [0x80, 0x00],
    },
    {
        text: '10″',
        minimalCircumference: 520,
        maximalCircumference: 880,
        code: [0xa0, 0x00],
    },
    {
        text: '12″',
        minimalCircumference: 910,
        maximalCircumference: 1300,
        code: [0xc0, 0x00],
    },
    {
        text: '14″',
        minimalCircumference: 910,
        maximalCircumference: 1300,
        code: [0xe0, 0x00],
    },
    {
        text: '16″',
        minimalCircumference: 1208,
        maximalCircumference: 1600,
        code: [0x00, 0x01],
    },
    {
        text: '17″',
        minimalCircumference: 1208,
        maximalCircumference: 1600,
        code: [0x10, 0x01],
    },
    {
        text: '18″',
        minimalCircumference: 1208,
        maximalCircumference: 1600,
        code: [0x10, 0x01],
    },
    {
        text: '20″',
        minimalCircumference: 1290,
        maximalCircumference: 1880,
        code: [0x40, 0x01],
    },
    {
        text: '22″',
        minimalCircumference: 1290,
        maximalCircumference: 1880,
        code: [0x60, 0x01],
    },
    {
        text: '23″',
        minimalCircumference: 1290,
        maximalCircumference: 1880,
        code: [0x70, 0x01],
    },
    {
        text: '24″',
        minimalCircumference: 1290,
        maximalCircumference: 2200,
        code: [0x80, 0x01],
    },
    {
        text: '25″',
        minimalCircumference: 1880,
        maximalCircumference: 2200,
        code: [0x90, 0x01],
    },
    {
        text: '26″',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xa0, 0x01],
    },
    {
        text: '27″',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xb0, 0x01],
    },
    {
        text: '27.5″',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xb5, 0x01],
    },
    {
        text: '28″',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xc0, 0x01],
    },
    {
        text: '29″',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xd0, 0x01],
    },
    {
        text: '32″',
        minimalCircumference: 2200,
        maximalCircumference: 2652,
        code: [0x00, 0x02],
    },
    {
        text: '400 mm',
        minimalCircumference: 1208,
        maximalCircumference: 1600,
        code: [0x00, 0x19],
    },
    {
        text: '450 mm',
        minimalCircumference: 1208,
        maximalCircumference: 1600,
        code: [0x10, 0x2c],
    },
    {
        text: '600 mm',
        minimalCircumference: 1600,
        maximalCircumference: 2200,
        code: [0x80, 0x25],
    },
    {
        text: '650 mm',
        minimalCircumference: 1600,
        maximalCircumference: 2200,
        code: [0xa0, 0x28],
    },
    {
        text: '700 mm',
        minimalCircumference: 1880,
        maximalCircumference: 2510,
        code: [0xc0, 0x2b],
    },
];

type ErrorCodeDescription = { description: string; recommendations: string };

const ErrorCodes: {
    [key: number]: ErrorCodeDescription | null;
} = {
    4: null,
    5: null,
    7: null,
    8: {
        description: 'Inner motor hall sensor (not speed hall sensor) error',
        recommendations:
            'Check cable connection (for motorwheels), replace motor, try repair motor with disassembling if you are electronics specialist',
    },
    9: null,
    10: null,
    11: null,
    12: null,
    14: {
        description: 'Motor communication error',
        recommendations:
            'Check connection with motor. If its overheated, let it cool down. Check if motor has supply. Check contacts in connectors for dirt and damage.',
    },
    15: null,
    21: {
        description: 'Hall sensor error',
        recommendations:
            'Check magnet on wheel. Check connection with of hall sensor. Check hall sensor with multimeter. Try to connect spare sensor if available.',
    },
    25: null,
    26: null,
    27: null,
    30: null,
    33: null,
    35: null,
    36: null,
    37: null,
    41: null,
    42: null,
    43: null,
    45: null,
    46: null,
    47: null,
    48: null,
    71: null,
    81: null,
};
export function getErrorCodeText(code: number): ErrorCodeDescription {
    if (ErrorCodes[code]) return ErrorCodes[code] as ErrorCodeDescription;
    if (ErrorCodes[code] === null)
        return {
            description: 'Description for this code is not available', // TODO
            recommendations: '-',
        };
    return {
        description: 'Unknown code',
        recommendations: '-',
    };
}
