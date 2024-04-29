import {
    BafangBesstCodes,
    BafangCanAssistLevel,
    BafangCanControllerCodes,
    BafangCanControllerParameters1,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanMotorType,
    BafangCanPedalSensorType,
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanTemperatureSensorType,
    BafangCanWheelDiameterTable,
} from '../types/BafangCanSystemTypes';
import { NotAvailable, NotLoadedYet } from '../types/no_data';

export function getEmptyControllerRealtimeData(): BafangCanControllerRealtime {
    return {
        controller_cadence: NotLoadedYet,
        controller_torque: NotLoadedYet,
        controller_speed: NotLoadedYet,
        controller_current: NotLoadedYet,
        controller_voltage: NotLoadedYet,
        controller_temperature: NotLoadedYet,
        controller_motor_temperature: NotLoadedYet,
        controller_walk_assistance: NotLoadedYet,
        controller_calories: NotLoadedYet,
        controller_remaining_capacity: NotLoadedYet,
        controller_single_trip: NotLoadedYet,
        controller_remaining_distance: NotLoadedYet,
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

export function getEmptyControllerParameters1(): BafangCanControllerParameters1 {
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
        controller_speed_sensor_channel_number: 1,
        controller_motor_type: BafangCanMotorType.HubMotor,
        controller_motor_pole_pair_number: 0,
        controller_magnets_on_speed_sensor: 0,
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
        controller_pas_start_current: 0,
        controller_pas_current_loading_time: 0,
        controller_pas_current_load_shedding_time: 0,
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

export function getEmptyControllerSpeedParameters(): BafangCanControllerSpeedParameters {
    return {
        controller_wheel_diameter: NotLoadedYet,
        controller_speed_limit: NotLoadedYet,
        controller_circumference: NotLoadedYet,
    };
}

export function getEmptyDisplayData(): BafangCanDisplayData {
    return {
        display_total_mileage: NotLoadedYet,
        display_single_mileage: NotLoadedYet,
        display_max_speed: NotLoadedYet,
        display_average_speed: NotLoadedYet,
        display_service_mileage: NotLoadedYet,
        display_last_shutdown_time: NotLoadedYet,
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
        controller_bootload_version: NotLoadedYet,
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
        sensor_manufacturer: NotLoadedYet,
        sensor_bootload_version: NotLoadedYet,
    };
}

export function getEmptyBesstCodes(): BafangBesstCodes {
    return {
        besst_hardware_version: NotLoadedYet,
        besst_software_version: NotLoadedYet,
        besst_serial_number: NotLoadedYet,
    };
}

export function getControllerRealtimeDemoData(): BafangCanControllerRealtime {
    return {
        controller_cadence: 0,
        controller_torque: 750,
        controller_speed: 0,
        controller_current: 0,
        controller_voltage: 29.7,
        controller_temperature: 24,
        controller_motor_temperature: 25,
        controller_walk_assistance: false,
        controller_calories: 0,
        controller_remaining_capacity: 0,
        controller_single_trip: 0,
        controller_remaining_distance: 0,
    };
}

export function getDisplayRealtimeDemoData(): BafangCanDisplayState {
    return {
        display_assist_levels: 5,
        display_ride_mode: BafangCanRideMode.ECO,
        display_boost: false,
        display_current_assist_level: 0,
        display_light: false,
        display_button: false,
    };
}

export function getSensorRealtimeDemoData(): BafangCanSensorRealtime {
    return {
        sensor_torque: 750,
        sensor_cadence: 0,
    };
}

export function getControllerParameters1Demo(): BafangCanControllerParameters1 {
    return {
        controller_system_voltage: 36, //TODO fill with data
        controller_current_limit: 1,
        controller_overvoltage: 1,
        controller_undervoltage: 1,
        controller_undervoltage_under_load: 1,
        controller_battery_recovery_voltage: 1,
        controller_battery_capacity: 1,
        controller_max_current_on_low_charge: 1,
        controller_full_capacity_range: 1,
        controller_pedal_sensor_type:
            BafangCanPedalSensorType.TorqueSensor,
        controller_coaster_brake: false,
        controller_speed_sensor_channel_number: 1,
        controller_motor_type: BafangCanMotorType.HubMotor,
        controller_motor_pole_pair_number: 1,
        controller_magnets_on_speed_sensor: 1,
        controller_temperature_sensor_type:
            BafangCanTemperatureSensorType.NoSensor,
        controller_deceleration_ratio: 1,
        controller_motor_max_rotor_rpm: 1,
        controller_motor_d_axis_inductance: 1,
        controller_motor_q_axis_inductance: 1,
        controller_motor_phase_resistance: 1,
        controller_motor_reverse_potential_coefficient: 1,
        controller_throttle_start_voltage: 1,
        controller_throttle_max_voltage: 1,
        controller_pas_start_current: 1,
        controller_pas_current_loading_time: 1,
        controller_pas_current_load_shedding_time: 1,
        controller_assist_levels: [
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
            { current_limit: 1, speed_limit: 1 },
        ],
        controller_displayless_mode: false,
        controller_lamps_always_on: false,
    };
}

export function getControllerSpeedParametersDemo(): BafangCanControllerSpeedParameters {
    return {
        controller_wheel_diameter: BafangCanWheelDiameterTable[14],
        controller_speed_limit: 25,
        controller_circumference: 2224,
    };
}

export function getDisplayDemoData(): BafangCanDisplayData {
    return {
        display_total_mileage: 10000,
        display_single_mileage: 1000,
        display_max_speed: 0,
        display_average_speed: 0,
        display_service_mileage: 0,
        display_last_shutdown_time: 5,
    };
}

export function getControllerCodesEmpty(): BafangCanControllerCodes {
    return {
        controller_hardware_version: 'CR X10V.350.FC 2.1',
        controller_software_version: 'CRX10VC3615E101004.0',
        controller_model_number: 'CR X10V.350.FC',
        controller_serial_number: 'CRX10V.350.FC2.1A42F5TB045999',
        controller_customer_number: '',
        controller_manufacturer: 'BAFANG',
        controller_bootload_version: NotAvailable,
    };
}

export function getDisplayCodesDemo(): BafangCanDisplayCodes {
    return {
        display_hardware_version: 'DP C221.C 2.0',
        display_software_version: 'DPC221CE10205.1',
        display_model_number: 'DP C221.CAN',
        display_serial_number: 'DPC221.C2.0702F8WC080505',
        display_customer_number: '0049-0074',
        display_manufacturer: 'BAFANG',
        display_bootload_version: 'APM32.DPCAN.V3.0.1',
    };
}

export function getSensorCodesDemo(): BafangCanSensorCodes {
    return {
        sensor_hardware_version: 'SR PA212.32.ST.C 1.0',
        sensor_software_version: 'SRPA212CF10101.0',
        sensor_model_number: 'SR PA212.32.ST.C',
        sensor_serial_number: '0000000000',
        sensor_customer_number: NotAvailable,
        sensor_manufacturer: NotAvailable,
        sensor_bootload_version: NotAvailable,
    };
}

export function getBesstCodesDemo(): BafangBesstCodes {
    return {
        besst_hardware_version: 'BESST.UC 3.0.3',
        besst_software_version: 'BSF33.05',
        besst_serial_number: '',
    };
}

export function decodeCurrentAssistLevel(
    currentAssistLevelCode: number,
    totalAssistLevels: number,
): BafangCanAssistLevel {
    let assistLevelTable: {
        [key: number]: { [key: number]: BafangCanAssistLevel };
    } = {
        3: { 0: 0, 12: 1, 2: 2, 3: 3, 6: 'walk' },
        4: { 0: 0, 1: 1, 12: 2, 21: 3, 3: 4, 6: 'walk' },
        5: { 0: 0, 11: 1, 13: 2, 21: 3, 23: 4, 3: 5, 6: 'walk' },
        9: {
            0: 0,
            1: 1,
            11: 2,
            12: 3,
            13: 4,
            2: 5,
            21: 6,
            22: 7,
            23: 8,
            3: 9,
            6: 'walk',
        },
    };
    if (
        (totalAssistLevels <= 3 || totalAssistLevels >= 5) &&
        totalAssistLevels != 9
    ) {
        totalAssistLevels = 5;
    }
    return assistLevelTable[totalAssistLevels][currentAssistLevelCode];
}
