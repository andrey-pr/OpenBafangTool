import i18n from '../i18n/i18n';
import { BafangAssistProfile } from './common';

export const Voltage = [24, 36, 48, 43];

export type BafangUartMotorInfo = {
    serial_number: string;
    model: string;
    manufacturer: string;
    system_code: string;
    firmware_version: string;
    hardware_version: string;
    voltage: number;
    max_current: number;
};

export function checkInfo(info: BafangUartMotorInfo): boolean {
    if (info.serial_number.length < 3 || info.serial_number.length > 60) {
        return false;
    }
    return true;
}

export enum SpeedmeterType {
    External = 0,
    Internal = 1,
    Motorphase = 2,
}

export const SpeedmeterTypeOptions = [
    {
        value: SpeedmeterType.External,
        label: i18n.t('external'),
    },
    {
        value: SpeedmeterType.Internal,
        label: i18n.t('internal'),
    },
    {
        value: SpeedmeterType.Motorphase,
        label: i18n.t('motorphase'),
    },
];

export type BafangUartMotorBasicParameters = {
    low_battery_protection: number;
    current_limit: number;
    assist_profiles: BafangAssistProfile[];
    wheel_diameter: number;
    magnets_per_wheel_rotation: number;
    speedmeter_type: SpeedmeterType;
};

export function checkBasicParameters(
    basicParameters: BafangUartMotorBasicParameters,
): boolean {
    if (
        basicParameters.low_battery_protection < 1 ||
        basicParameters.low_battery_protection > 60
    ) {
        return false;
    }
    if (
        basicParameters.current_limit < 1 ||
        basicParameters.current_limit > 100
    ) {
        return false;
    }
    if (basicParameters.assist_profiles.length !== 10) {
        return false;
    }
    for (let i = 0; i < 10; i++) {
        if (
            basicParameters.assist_profiles[i].current_limit < 0 ||
            basicParameters.assist_profiles[i].current_limit > 100 ||
            basicParameters.assist_profiles[i].speed_limit < 0 ||
            basicParameters.assist_profiles[i].speed_limit > 100
        ) {
            return false;
        }
    }
    if (
        basicParameters.wheel_diameter < 1 ||
        basicParameters.wheel_diameter > 100
    ) {
        return false;
    }
    if (
        basicParameters.magnets_per_wheel_rotation < 1 ||
        basicParameters.magnets_per_wheel_rotation > 10
    ) {
        return false;
    }
    if (!(basicParameters.speedmeter_type in SpeedmeterType)) {
        return false;
    }
    return true;
}

export enum PedalType {
    None = 0,
    DHSensor12 = 1,
    BBSensor32 = 2,
    DoubleSignal24 = 3,
}

export const PedalTypeOptions = [
    { value: PedalType.None, label: i18n.t('none') },
    {
        value: PedalType.DHSensor12,
        label: i18n.t('dh_sensor_12'),
    },
    {
        value: PedalType.BBSensor32,
        label: i18n.t('bb_sensor_32'),
    },
    {
        value: PedalType.DoubleSignal24,
        label: i18n.t('double_signal_24'),
    },
];

export const PedalSensorSignals = { 0: 1, 1: 12, 2: 32, 3: 24 };

export enum AssistLevel {
    AssistLevel0 = 0,
    AssistLevel1 = 1,
    AssistLevel2 = 2,
    AssistLevel3 = 3,
    AssistLevel4 = 4,
    AssistLevel5 = 5,
    AssistLevel6 = 6,
    AssistLevel7 = 7,
    AssistLevel8 = 8,
    AssistLevel9 = 9,
    ByDisplay = 255,
}

export const AssistLevelOptions = [
    {
        value: AssistLevel.ByDisplay,
        label: i18n.t('by_display'),
    },
    {
        value: AssistLevel.AssistLevel0,
        label: `${i18n.t('level')} 0`,
    },
    {
        value: AssistLevel.AssistLevel1,
        label: `${i18n.t('level')} 1`,
    },
    {
        value: AssistLevel.AssistLevel2,
        label: `${i18n.t('level')} 2`,
    },
    {
        value: AssistLevel.AssistLevel3,
        label: `${i18n.t('level')} 3`,
    },
    {
        value: AssistLevel.AssistLevel4,
        label: `${i18n.t('level')} 4`,
    },
    {
        value: AssistLevel.AssistLevel5,
        label: `${i18n.t('level')} 5`,
    },
    {
        value: AssistLevel.AssistLevel6,
        label: `${i18n.t('level')} 6`,
    },
    {
        value: AssistLevel.AssistLevel7,
        label: `${i18n.t('level')} 7`,
    },
    {
        value: AssistLevel.AssistLevel8,
        label: `${i18n.t('level')} 8`,
    },
    {
        value: AssistLevel.AssistLevel9,
        label: `${i18n.t('level')} 9`,
    },
];

export const SpeedLimitByDisplay: number = 255;

export const SimplifiedPedalSpeedLimitOptions = [
    {
        value: 16,
        label: `16 ${i18n.t('km/h')}`,
    },
    {
        value: 25,
        label: `25 ${i18n.t('km/h')}`,
    },
    {
        value: SpeedLimitByDisplay,
        label: i18n.t('by_limit_in_display'),
    },
];

export type BafangUartMotorPedalParameters = {
    pedal_type: PedalType;
    pedal_assist_level: AssistLevel;
    pedal_speed_limit: number;
    pedal_start_current: number;
    pedal_slow_start_mode: number;
    pedal_signals_before_start: number;
    pedal_time_to_stop: number;
    pedal_current_decay: number;
    pedal_stop_decay: number;
    pedal_keep_current: number;
};

export function checkPedalParameters(
    pedalParameters: BafangUartMotorPedalParameters,
): boolean {
    if (!(pedalParameters.pedal_type in PedalType)) {
        return false;
    }
    if (!(pedalParameters.pedal_assist_level in AssistLevel)) {
        return false;
    }
    if (
        pedalParameters.pedal_speed_limit < 1 ||
        pedalParameters.pedal_speed_limit > 255
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_start_current < 0 ||
        pedalParameters.pedal_start_current > 255
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_slow_start_mode < 1 ||
        pedalParameters.pedal_slow_start_mode > 8
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_signals_before_start < 1 ||
        pedalParameters.pedal_signals_before_start > 255
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_time_to_stop < 10 ||
        pedalParameters.pedal_time_to_stop > 2550
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_current_decay < 1 ||
        pedalParameters.pedal_current_decay > 255
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_stop_decay < 0 ||
        pedalParameters.pedal_stop_decay > 2550
    ) {
        return false;
    }
    if (
        pedalParameters.pedal_keep_current < 0 ||
        pedalParameters.pedal_keep_current > 100
    ) {
        return false;
    }
    return true;
}

export enum ThrottleMode {
    Speed = 0,
    Current = 1,
}

export const ThrottleModeOptions = [
    {
        value: ThrottleMode.Speed,
        label: i18n.t('speed'),
    },
    {
        value: ThrottleMode.Current,
        label: i18n.t('current'),
    },
];

export type BafangUartMotorThrottleParameters = {
    throttle_start_voltage: number;
    throttle_end_voltage: number;
    throttle_mode: ThrottleMode;
    throttle_assist_level: AssistLevel;
    throttle_speed_limit: number;
    throttle_start_current: number;
};

export function checkThrottleParameters(
    throttleParameters: BafangUartMotorThrottleParameters,
): boolean {
    if (
        throttleParameters.throttle_start_voltage < 0 ||
        throttleParameters.throttle_start_voltage > 25.5
    ) {
        return false;
    }
    if (
        throttleParameters.throttle_end_voltage < 0 ||
        throttleParameters.throttle_end_voltage > 25.5
    ) {
        return false;
    }
    if (!(throttleParameters.throttle_mode in ThrottleMode)) {
        return false;
    }
    if (!(throttleParameters.throttle_assist_level in AssistLevel)) {
        return false;
    }
    if (
        throttleParameters.throttle_speed_limit < 0 ||
        throttleParameters.throttle_speed_limit > 255
    ) {
        return false;
    }
    if (
        throttleParameters.throttle_start_current < 0 ||
        throttleParameters.throttle_start_current > 255
    ) {
        return false;
    }
    return true;
}

interface ParameterCodesStruct {
    [key: number]: {
        name: string;
        parameters: string[];
    };
}

export const ParameterCodes: ParameterCodesStruct = {
    0x52: {
        name: 'basic',
        parameters: [
            'low_voltage_limit',
            'current_limit',
            'assist_profile_0_current_limit',
            'assist_profile_0_current_speed',
            'assist_profile_1_current_limit',
            'assist_profile_1_current_speed',
            'assist_profile_2_current_limit',
            'assist_profile_2_current_speed',
            'assist_profile_3_current_limit',
            'assist_profile_3_current_speed',
            'assist_profile_4_current_limit',
            'assist_profile_4_current_speed',
            'assist_profile_5_current_limit',
            'assist_profile_5_current_speed',
            'assist_profile_6_current_limit',
            'assist_profile_6_current_speed',
            'assist_profile_7_current_limit',
            'assist_profile_7_current_speed',
            'assist_profile_8_current_limit',
            'assist_profile_8_current_speed',
            'assist_profile_9_current_limit',
            'assist_profile_9_current_speed',
            'wheel_diameter',
            'speedmeter_type',
        ],
    },
    0x53: {
        name: 'pedal',
        parameters: [
            'pedal_type',
            'pedal_assist_level',
            'pedal_speed_limit',
            'pedal_start_current',
            'pedal_slow_start_mode',
            'pedal_signals_before_start',
            'unused',
            'pedal_time_to_stop',
            'pedal_current_decay',
            'pedal_stop_decay',
            'pedal_keep_current',
        ],
    },
    0x54: {
        name: 'throttle',
        parameters: [
            'throttle_start_voltage',
            'throttle_end_voltage',
            'throttle_mode',
            'throttle_assist_level',
            'throttle_speed_limit',
            'throttle_start_current',
        ],
    },
};

interface ParameterNamesStruct {
    [key: string]: string;
}

export const ParameterNames: ParameterNamesStruct = {
    basic: i18n.t('basic_parameters'),
    pedal: i18n.t('pedal_parameters'),
    throttle: i18n.t('throttle_parameters'),
    low_voltage_limit: i18n.t('battery_low_limit'),
    current_limit: i18n.t('current_limit'),
    assist_profile_0_current_limit: 'Assist Profile 0 Current Limit',//TODO
    assist_profile_0_current_speed: 'Assist Profile 0 Speed Limit',
    assist_profile_1_current_limit: 'Assist Profile 1 Current Limit',
    assist_profile_1_current_speed: 'Assist Profile 1 Speed Limit',
    assist_profile_2_current_limit: 'Assist Profile 2 Current Limit',
    assist_profile_2_current_speed: 'Assist Profile 2 Speed Limit',
    assist_profile_3_current_limit: 'Assist Profile 3 Current Limit',
    assist_profile_3_current_speed: 'Assist Profile 3 Speed Limit',
    assist_profile_4_current_limit: 'Assist Profile 4 Current Limit',
    assist_profile_4_current_speed: 'Assist Profile 4 Speed Limit',
    assist_profile_5_current_limit: 'Assist Profile 5 Current Limit',
    assist_profile_5_current_speed: 'Assist Profile 5 Speed Limit',
    assist_profile_6_current_limit: 'Assist Profile 6 Current Limit',
    assist_profile_6_current_speed: 'Assist Profile 6 Speed Limit',
    assist_profile_7_current_limit: 'Assist Profile 7 Current Limit',
    assist_profile_7_current_speed: 'Assist Profile 7 Speed Limit',
    assist_profile_8_current_limit: 'Assist Profile 8 Current Limit',
    assist_profile_8_current_speed: 'Assist Profile 8 Speed Limit',
    assist_profile_9_current_limit: 'Assist Profile 9 Current Limit',
    assist_profile_9_current_speed: 'Assist Profile 9 Speed Limit',
    wheel_diameter: i18n.t('wheel_diameter'),
    speedmeter_type: 'Speedmeter Type',
    pedal_type: 'Pedal Type',
    pedal_assist_level: 'Pedal Assist Level',
    pedal_speed_limit: 'Pedal Speed Limit',
    pedal_start_current: 'Pedal Start Current',
    pedal_slow_start_mode: 'Slow Start Mode',
    pedal_signals_before_start: 'Signals Before Start',
    unused: '',
    pedal_time_to_stop: 'Time To Stop',
    pedal_current_decay: i18n.t('current_decay'),
    pedal_stop_decay: i18n.t('pedal_stop_decay'),
    pedal_keep_current: 'Keep Current',
    throttle_start_voltage: 'Throttle Start Voltage',
    throttle_end_voltage: 'Throttle End Voltage',
    throttle_mode: 'Throttle Mode',
    throttle_assist_level: 'Throttle Assist Level',
    throttle_speed_limit: 'Throttle Speed Limit',
    throttle_start_current: 'Throttle Start Current',
};
