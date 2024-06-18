import { BafangAssistProfile } from './common';
import { NoData } from './no_data';

export type BafangCanControllerRealtime0 = {
    cadence: number;
    torque: number;
    remaining_capacity: number;
    single_trip: number;
    remaining_distance: number;
};

export type BafangCanControllerRealtime1 = {
    speed: number;
    current: number;
    voltage: number;
    temperature: number;
    motor_temperature: number;
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
        label: 'Torque sensor and throttle lever',
    },
    {
        value: PedalSensorType.CadenceSensor,
        label: 'Cadence sensor and throttle lever',
    },
    {
        value: PedalSensorType.ThrottleLeverOnly,
        label: 'Throttle lever only',
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
    controller_system_voltage: SystemVoltage;
    controller_current_limit: number;
    controller_overvoltage: number;
    controller_undervoltage: number;
    controller_undervoltage_under_load: number;
    controller_battery_recovery_voltage: number;
    controller_battery_capacity: number;
    controller_max_current_on_low_charge: number;
    controller_full_capacity_range: number;
    controller_pedal_sensor_type: PedalSensorType;
    controller_coaster_brake: boolean;
    controller_pedal_sensor_signals_per_rotation: number;
    controller_speed_sensor_channel_number: SpeedSensorChannelNumber;
    controller_motor_type: MotorType;
    controller_motor_pole_pair_number: number;
    controller_speedmeter_magnets_number: number;
    controller_temperature_sensor_type: TemperatureSensorType;
    controller_deceleration_ratio: number;
    controller_motor_max_rotor_rpm: number;
    controller_motor_d_axis_inductance: number;
    controller_motor_q_axis_inductance: number;
    controller_motor_phase_resistance: number;
    controller_motor_reverse_potential_coefficient: number;
    controller_throttle_start_voltage: number;
    controller_throttle_max_voltage: number;
    controller_start_current: number;
    controller_current_loading_time: number;
    controller_current_shedding_time: number;
    controller_assist_levels: BafangAssistProfile[];
    controller_displayless_mode: boolean;
    controller_lamps_always_on: boolean;
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
    controller_torque_profiles: TorqueProfile[];
};

export type Wheel = {
    text: string;
    minimalCircumference: number;
    maximalCircumference: number;
    code: number[];
};

export type BafangCanControllerSpeedParameters = {
    controller_wheel_diameter: Wheel;
    controller_speed_limit: number;
    controller_circumference: number;
};

export type BafangCanControllerCodes = {
    controller_hardware_version: string | NoData;
    controller_software_version: string | NoData;
    controller_model_number: string | NoData;
    controller_serial_number: string | NoData;
    controller_customer_number: string | NoData;
    controller_manufacturer: string | NoData;
};

export type BafangCanDisplayCodes = {
    display_hardware_version: string | NoData;
    display_software_version: string | NoData;
    display_model_number: string | NoData;
    display_serial_number: string | NoData;
    display_customer_number: string | NoData;
    display_manufacturer: string | NoData;
    display_bootload_version: string | NoData;
};

export type BafangCanDisplayData1 = {
    display_total_mileage: number;
    display_single_mileage: number;
    display_max_speed: number;
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

export type BafangCanSensorCodes = {
    sensor_hardware_version: string | NoData;
    sensor_software_version: string | NoData;
    sensor_model_number: string | NoData;
    sensor_serial_number: string | NoData;
    sensor_customer_number: string | NoData;
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

export type BafangCanBatteryCodes = {
    battery_hardware_version: string | NoData;
    battery_software_version: string | NoData;
    battery_model_number: string | NoData;
    battery_serial_number: string | NoData;
};

export type BafangBesstCodes = {
    besst_hardware_version: string | NoData;
    besst_software_version: string | NoData;
    besst_serial_number: string | NoData;
};
