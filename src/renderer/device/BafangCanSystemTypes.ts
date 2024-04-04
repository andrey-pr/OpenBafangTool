//TODO make all values nullable

export type BafangCanControllerRealtime = {
    controller_cadence: number;
    controller_torque: number;
    controller_speed: number;
    controller_current: number;
    controller_voltage: number;
    controller_temperature: number;
    controller_motor_temperature: number;
    controller_walk_assistance: boolean;
    controller_calories: number;
    controller_remaining_capacity: number;
    controller_single_trip: number;
    controller_remaining_distance: number;
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

export type BafangCanControllerCodes = {
    controller_hardware_version: string;
    controller_software_version: string;
    controller_model_number: string;
    controller_serial_number: string;
    controller_customer_number: string;
    controller_manufacturer: string;
    controller_bootload_version: string;
};

export type BafangCanDisplayCodes = {
    display_hardware_version: string;
    display_software_version: string;
    display_model_number: string;
    display_serial_number: string;
    display_customer_number: string;
    display_manufacturer: string;
    display_bootload_version: string;
};

export type BafangCanDisplayData = {
    display_total_mileage: number;
    display_single_mileage: number;
    display_max_speed: number;
    display_average_speed: number;
    display_service_mileage: number;
    display_last_shutdown_time: number;
};

export enum BafangCanRideMode {
    ECO = 0,
    BOOST = 1,
}

export type BafangCanDisplayState = {
    display_total_gears: number;
    display_ride_mode: BafangCanRideMode;
    display_boost: boolean;
    display_current_gear_level: number;
    display_light: boolean;
    display_button: boolean;
};

export type BafangCanSensorRealtime = {
    sensor_torque: number;
    sensor_cadence: number;
};

export type BafangCanSensorCodes = {
    sensor_hardware_version: string;
    sensor_software_version: string;
    sensor_model_number: string;
    sensor_serial_number: string;
    sensor_customer_number: string;
    sensor_manufacturer: string;
    sensor_bootload_version: string;
};
