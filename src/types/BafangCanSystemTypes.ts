import { NoData } from './no_data';

export type BafangCanControllerRealtime = {
    controller_cadence: number | NoData;
    controller_torque: number | NoData;
    controller_speed: number | NoData;
    controller_current: number | NoData;
    controller_voltage: number | NoData;
    controller_temperature: number | NoData;
    controller_motor_temperature: number | NoData;
    controller_walk_assistance: boolean | NoData;
    controller_calories: number | NoData;
    controller_remaining_capacity: number | NoData;
    controller_single_trip: number | NoData;
    controller_remaining_distance: number | NoData;
};

export type BafangCanAssistProfile = {
    current_limit: number;
    speed_limit: number;
};

export type BafangCanSystemVoltage = 36 | 43 | 48;

export enum BafangCanPedalSensorType {
    TorqueSensor = 0,
    CadenceSensor = 1,
    ThrottleLeverOnly = 2,
}

export enum BafangCanMotorType {
    HubMotor = 0,
    MidDriveMotor = 1,
    DirectDriveMotor = 2,
}

export enum BafangCanTemperatureSensorType {
    NoSensor = 0,
    K10 = 1,
    PT1000 = 2,
}

export type BafangCanSpeedSensorChannelNumber = 1 | 2;

export type BafangCanControllerParameters1 = {
    controller_system_voltage: BafangCanSystemVoltage;
    controller_current_limit: number;
    controller_overvoltage: number;
    controller_undervoltage: number;
    controller_undervoltage_under_load: number;
    controller_battery_recovery_voltage: number;
    controller_battery_capacity: number;
    controller_max_current_on_low_charge: number;
    // Battery "Capacity percentage for current begins to decay" - int/percents, read, write
    // Battery "Capacity percentage for current begins to decay coefficient" - int/percents, read, write
    controller_full_capacity_range: number;
    controller_pedal_sensor_type: BafangCanPedalSensorType;
    controller_coaster_brake: boolean;
    // Pedal sensor "Speed signal channel number" - its something different, no read, no write
    controller_speed_sensor_channel_number: BafangCanSpeedSensorChannelNumber;
    // Pedal sensor "Check teeth for heel torque",
    controller_motor_type: BafangCanMotorType;
    controller_motor_pole_pair_number: number;
    controller_magnets_on_speed_sensor: number;
    controller_temperature_sensor_type: BafangCanTemperatureSensorType;
    controller_deceleration_ratio: number;
    controller_motor_max_rotor_rpm: number;
    controller_motor_d_axis_inductance: number;
    controller_motor_q_axis_inductance: number;
    controller_motor_phase_resistance: number;
    controller_motor_reverse_potential_coefficient: number;
    controller_throttle_start_voltage: number;
    controller_throttle_max_voltage: number;
    // Throttle "Speed limit switch function" - enum (0=no limit, 1=limit), read, write
    controller_pas_start_current: number;
    controller_pas_current_loading_time: number;
    controller_pas_current_load_shedding_time: number;
    controller_assist_levels: BafangCanAssistProfile[];
    controller_displayless_mode: boolean;
    controller_lamps_always_on: boolean;
    // System "Assist speed" (unknown): number;
};

export type BafangCanWheel = {
    text: string;
    minimalCircumference: number;
    maximalCircumference: number;
    code: number[];
};

export const BafangCanWheelDiameterTable: BafangCanWheel[] = [
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

export type BafangCanControllerSpeedParameters = {
    controller_wheel_diameter: BafangCanWheel | NoData;
    controller_speed_limit: number | NoData;
    controller_circumference: number | NoData;
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

export type BafangCanDisplayData = {
    display_total_mileage: number | NoData;
    display_single_mileage: number | NoData;
    display_max_speed: number | NoData;
    display_average_speed: number | NoData;
    display_service_mileage: number | NoData;
    display_last_shutdown_time: number | NoData;
};

export enum BafangCanRideMode {
    ECO = 0,
    BOOST = 1,
}

export type BafangCanAssistLevel =
    | 'walk'
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9;

export type BafangCanDisplayState = {
    display_assist_levels: number | NoData;
    display_ride_mode: BafangCanRideMode | NoData;
    display_boost: boolean | NoData;
    display_current_assist_level: BafangCanAssistLevel | NoData;
    display_light: boolean | NoData;
    display_button: boolean | NoData;
};

export type BafangCanSensorRealtime = {
    sensor_torque: number | NoData;
    sensor_cadence: number | NoData;
};

export type BafangCanSensorCodes = {
    sensor_hardware_version: string | NoData;
    sensor_software_version: string | NoData;
    sensor_model_number: string | NoData;
    sensor_serial_number: string | NoData;
    sensor_customer_number: string | NoData;
};

export type BafangBesstCodes = {
    besst_hardware_version: string | NoData;
    besst_software_version: string | NoData;
    besst_serial_number: string | NoData;
};
