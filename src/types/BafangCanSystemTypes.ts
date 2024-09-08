import i18n from '../i18n/i18n';
import { BafangAssistProfile } from './common';

export type BafangCanControllerRealtime0 = {
    cadence: number;
    torque: number;
    remaining_capacity: number;
    single_trip: number;
    remaining_distance: number | null;
};

export type BafangCanControllerRealtime1 = {
    speed: number;
    current: number;
    voltage: number;
    temperature: number;
    motor_temperature: number | null;
};

export type SystemVoltage = 36 | 43 | 48;

export enum PedalSensorType {
    TorqueSensor = 0,
    CadenceSensor = 1,
    ThrottleLeverOnly = 2,
}

export const TriggerTypeOptions = [
    {
        value: PedalSensorType.TorqueSensor,
        label: i18n.t('torque_and_lever'),
    },
    {
        value: PedalSensorType.CadenceSensor,
        label: i18n.t('cadence_and_lever'),
    },
    {
        value: PedalSensorType.ThrottleLeverOnly,
        label: i18n.t('throttle_lever_only'),
    },
];

export enum MotorType {
    HubMotor = 0,
    MidDriveMotor = 1,
    DirectDriveMotor = 2,
}

export enum TemperatureSensorType {
    NoSensor = 0,
    K10 = 1,
    PT1000 = 2,
}

export type SpeedSensorChannelNumber = 1 | 2;

export type BafangCanControllerParameter1 = {
    system_voltage: SystemVoltage;
    current_limit: number;
    overvoltage: number;
    undervoltage: number;
    undervoltage_under_load: number;
    battery_recovery_voltage: number;
    battery_capacity: number;
    max_current_on_low_charge: number;
    full_capacity_range: number;
    pedal_sensor_type: PedalSensorType;
    coaster_brake: boolean;
    pedal_sensor_signals_per_rotation: number;
    speed_sensor_channel_number: SpeedSensorChannelNumber;
    motor_type: MotorType;
    motor_pole_pair_number: number;
    speedmeter_magnets_number: number;
    temperature_sensor_type: TemperatureSensorType;
    deceleration_ratio: number;
    motor_max_rotor_rpm: number;
    motor_d_axis_inductance: number;
    motor_q_axis_inductance: number;
    motor_phase_resistance: number;
    motor_reverse_potential_coefficient: number;
    throttle_start_voltage: number;
    throttle_max_voltage: number;
    start_current: number;
    current_loading_time: number;
    current_shedding_time: number;
    assist_levels: BafangAssistProfile[];
    displayless_mode: boolean;
    lamps_always_on: boolean;
    walk_assist_speed: number;
};

export type TorqueProfile = {
    start_torque_value: number;
    max_torque_value: number;
    return_torque_value: number;
    min_current: number;
    max_current: number;
    start_pulse: number;
    current_decay_time: number;
    stop_delay: number;
};

export type BafangCanControllerParameter2 = {
    torque_profiles: TorqueProfile[];
};

export type Wheel = {
    text: string;
    minimalCircumference: number;
    maximalCircumference: number;
    code: number[];
};

export type BafangCanControllerSpeedParameters = {
    wheel_diameter: Wheel;
    speed_limit: number;
    circumference: number;
};

export type BafangCanDisplayData1 = {
    total_mileage: number;
    single_mileage: number;
    max_speed: number;
};

export type BafangCanDisplayData2 = {
    average_speed: number;
    service_mileage: number;
};

export enum BafangCanRideMode {
    ECO = 0,
    BOOST = 1,
}

export type AssistLevel = 'walk' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type BafangCanDisplayRealtimeData = {
    assist_levels: number;
    ride_mode: BafangCanRideMode;
    boost: boolean;
    current_assist_level: AssistLevel;
    light: boolean;
    button: boolean;
};

export type BafangCanSensorRealtime = {
    torque: number;
    cadence: number;
};

export type BafangCanBatteryCapacityData = {
    full_capacity: number;
    capacity_left: number;
    rsoc: number;
    asoc: number;
    soh: number;
};

export type BafangCanBatteryStateData = {
    voltage: number;
    current: number;
    temperature: number;
};
