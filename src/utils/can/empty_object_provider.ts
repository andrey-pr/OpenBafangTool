import { WheelDiameterTable } from '../../constants/BafangCanConstants';
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
    BafangCanDisplayRealtimeData,
    MotorType,
    PedalSensorType,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    TemperatureSensorType,
    BafangCanBatteryCodes,
    BafangCanBatteryCapacityData,
    BafangCanBatteryStateData,
} from '../../types/BafangCanSystemTypes';
import { NotLoadedYet } from '../../types/no_data';

export function getEmptyControllerRealtime0Data(): BafangCanControllerRealtime0 {
    return {
        cadence: 0,
        torque: 0,
        remaining_capacity: 0,
        single_trip: 0,
        remaining_distance: 0,
    };
}

export function getEmptyControllerRealtime1Data(): BafangCanControllerRealtime1 {
    return {
        speed: 0,
        current: 0,
        voltage: 0,
        temperature: 0,
        motor_temperature: 0,
    };
}

export function getEmptyDisplayRealtimeData(): BafangCanDisplayRealtimeData {
    return {
        assist_levels: 0,
        ride_mode: 0,
        boost: false,
        current_assist_level: 0,
        light: false,
        button: false,
    };
}

export function getEmptySensorRealtimeData(): BafangCanSensorRealtime {
    return {
        torque: 0,
        cadence: 0,
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
        controller_pedal_sensor_type: PedalSensorType.TorqueSensor,
        controller_coaster_brake: false,
        controller_pedal_sensor_signals_per_rotation: 0,
        controller_speed_sensor_channel_number: 1,
        controller_motor_type: MotorType.HubMotor,
        controller_motor_pole_pair_number: 0,
        controller_speedmeter_magnets_number: 0,
        controller_temperature_sensor_type: TemperatureSensorType.NoSensor,
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
        controller_wheel_diameter: WheelDiameterTable[0],
        controller_speed_limit: 0,
        controller_circumference: 0,
    };
}

export function getEmptyDisplayData1(): BafangCanDisplayData1 {
    return {
        display_total_mileage: 0,
        display_single_mileage: 0,
        display_max_speed: 0,
    };
}

export function getEmptyDisplayData2(): BafangCanDisplayData2 {
    return {
        average_speed: 0,
        service_mileage: 0,
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

export function getEmptyBatteryCellsVoltage(): number[] {
    return [0];
}

export function getEmptyBatteryCapacityData(): BafangCanBatteryCapacityData {
    return {
        full_capacity: 0,
        capacity_left: 0,
        rsoc: 0,
        asoc: 0,
        soh: 0,
    };
}

export function getEmptyBatteryStateData(): BafangCanBatteryStateData {
    return {
        voltage: 0,
        current: 0,
        temperature: 0,
    };
}

export function getEmptyBatteryCodes(): BafangCanBatteryCodes {
    return {
        battery_hardware_version: NotLoadedYet,
        battery_software_version: NotLoadedYet,
        battery_model_number: NotLoadedYet,
        battery_serial_number: NotLoadedYet,
    };
}

export function getEmptyBesstCodes(): BafangBesstCodes {
    return {
        besst_hardware_version: NotLoadedYet,
        besst_software_version: NotLoadedYet,
        besst_serial_number: NotLoadedYet,
    };
}
