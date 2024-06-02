import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanControllerSpeedParameters,
    BafangCanDisplayCodes,
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayState,
    BafangCanMotorType,
    BafangCanPedalSensorType,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanTemperatureSensorType,
} from '../../types/BafangCanSystemTypes';
import { NotLoadedYet } from '../../types/no_data';

export function getEmptyControllerRealtime0Data(): BafangCanControllerRealtime0 {
    return {
        controller_cadence: NotLoadedYet,
        controller_torque: NotLoadedYet,
        controller_remaining_capacity: NotLoadedYet,
        controller_single_trip: NotLoadedYet,
        controller_remaining_distance: NotLoadedYet,
    };
}

export function getEmptyControllerRealtime1Data(): BafangCanControllerRealtime1 {
    return {
        controller_speed: NotLoadedYet,
        controller_current: NotLoadedYet,
        controller_voltage: NotLoadedYet,
        controller_temperature: NotLoadedYet,
        controller_motor_temperature: NotLoadedYet,
    };
}

export function getEmptyDisplayRealtimeData(): BafangCanDisplayState {
    return {
        display_assist_levels: NotLoadedYet,
        display_ride_mode: NotLoadedYet,
        display_boost: NotLoadedYet,
        display_current_assist_level: NotLoadedYet,
        display_light: NotLoadedYet,
        display_button: NotLoadedYet,
    };
}

export function getEmptySensorRealtimeData(): BafangCanSensorRealtime {
    return {
        sensor_torque: NotLoadedYet,
        sensor_cadence: NotLoadedYet,
    };
}

export function getEmptyControllerParameter1(): BafangCanControllerParameter1 {
    return {
        controller_system_voltage: 36,
        controller_current_limit: 0,
        controller_overvoltage: 0,
        controller_undervoltage: 0,
        controller_undervoltage_under_load: 0,
        controller_battery_recovery_voltage: 0,
        controller_battery_capacity: 0,
        controller_max_current_on_low_charge: 0,
        controller_full_capacity_range: 0,
        controller_pedal_sensor_type: BafangCanPedalSensorType.TorqueSensor,
        controller_coaster_brake: false,
        controller_pedal_sensor_signals_per_rotation: 0,
        controller_speed_sensor_channel_number: 1,
        controller_motor_type: BafangCanMotorType.HubMotor,
        controller_motor_pole_pair_number: 0,
        controller_speedmeter_magnets_number: 0,
        controller_temperature_sensor_type:
            BafangCanTemperatureSensorType.NoSensor,
        controller_deceleration_ratio: 0,
        controller_motor_max_rotor_rpm: 0,
        controller_motor_d_axis_inductance: 0,
        controller_motor_q_axis_inductance: 0,
        controller_motor_phase_resistance: 0,
        controller_motor_reverse_potential_coefficient: 0,
        controller_throttle_start_voltage: 0,
        controller_throttle_max_voltage: 0,
        controller_start_current: 0,
        controller_current_loading_time: 0,
        controller_current_shedding_time: 0,
        controller_assist_levels: [
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
            { current_limit: 0, speed_limit: 0 },
        ],
        controller_displayless_mode: false,
        controller_lamps_always_on: false,
    };
}

export function getEmptyControllerParameter2(): BafangCanControllerParameter2 {
    return {
        controller_torque_profiles: [
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
            {
                start_torque_value: 0,
                max_torque_value: 0,
                return_torque_value: 0,
                min_current: 0,
                max_current: 0,
                start_pulse: 0,
                current_decay_time: 0,
                stop_delay: 0,
            },
        ],
    };
}

export function getEmptyControllerSpeedParameters(): BafangCanControllerSpeedParameters {
    return {
        controller_wheel_diameter: NotLoadedYet,
        controller_speed_limit: NotLoadedYet,
        controller_circumference: NotLoadedYet,
    };
}

export function getEmptyDisplayData1(): BafangCanDisplayData1 {
    return {
        display_total_mileage: NotLoadedYet,
        display_single_mileage: NotLoadedYet,
        display_max_speed: NotLoadedYet,
    };
}

export function getEmptyDisplayData2(): BafangCanDisplayData2 {
    return {
        display_average_speed: NotLoadedYet,
        display_service_mileage: NotLoadedYet,
    };
}

export function getEmptyControllerCodes(): BafangCanControllerCodes {
    return {
        controller_hardware_version: NotLoadedYet,
        controller_software_version: NotLoadedYet,
        controller_model_number: NotLoadedYet,
        controller_serial_number: NotLoadedYet,
        controller_customer_number: NotLoadedYet,
        controller_manufacturer: NotLoadedYet,
    };
}

export function getEmptyDisplayCodes(): BafangCanDisplayCodes {
    return {
        display_hardware_version: NotLoadedYet,
        display_software_version: NotLoadedYet,
        display_model_number: NotLoadedYet,
        display_serial_number: NotLoadedYet,
        display_customer_number: NotLoadedYet,
        display_manufacturer: NotLoadedYet,
        display_bootload_version: NotLoadedYet,
    };
}

export function getEmptySensorCodes(): BafangCanSensorCodes {
    return {
        sensor_hardware_version: NotLoadedYet,
        sensor_software_version: NotLoadedYet,
        sensor_model_number: NotLoadedYet,
        sensor_serial_number: NotLoadedYet,
        sensor_customer_number: NotLoadedYet,
    };
}

export function getEmptyBesstCodes(): BafangBesstCodes {
    return {
        besst_hardware_version: NotLoadedYet,
        besst_software_version: NotLoadedYet,
        besst_serial_number: NotLoadedYet,
    };
}