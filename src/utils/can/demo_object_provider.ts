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
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanTemperatureSensorType,
    BafangCanWheelDiameterTable,
} from '../../types/BafangCanSystemTypes';
import { NotAvailable } from '../../types/no_data';

export function getControllerRealtime0DemoData(): BafangCanControllerRealtime0 {
    return {
        controller_cadence: 0,
        controller_torque: 750,
        controller_remaining_capacity: 0,
        controller_single_trip: 0,
        controller_remaining_distance: 0,
    };
}

export function getControllerRealtime1DemoData(): BafangCanControllerRealtime1 {
    return {
        controller_speed: 0,
        controller_current: 0,
        controller_voltage: 29.7,
        controller_temperature: 24,
        controller_motor_temperature: 25,
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

export function getControllerParameter1Demo(): BafangCanControllerParameter1 {
    return {
        controller_system_voltage: 36,
        controller_current_limit: 18,
        controller_overvoltage: 47,
        controller_undervoltage: 128,
        controller_undervoltage_under_load: 12,
        controller_battery_recovery_voltage: 172,
        controller_battery_capacity: 10000,
        controller_max_current_on_low_charge: 3,
        controller_full_capacity_range: 45,
        controller_pedal_sensor_type: BafangCanPedalSensorType.TorqueSensor,
        controller_coaster_brake: false,
        controller_pedal_sensor_signals_per_rotation: 24,
        controller_speed_sensor_channel_number: 2,
        controller_motor_type: BafangCanMotorType.MidDriveMotor,
        controller_motor_pole_pair_number: 4,
        controller_speedmeter_magnets_number: 1,
        controller_temperature_sensor_type: BafangCanTemperatureSensorType.K10,
        controller_deceleration_ratio: 36.5,
        controller_motor_max_rotor_rpm: 4300,
        controller_motor_d_axis_inductance: 0,
        controller_motor_q_axis_inductance: 0,
        controller_motor_phase_resistance: 0,
        controller_motor_reverse_potential_coefficient: 0,
        controller_throttle_start_voltage: 1.2,
        controller_throttle_max_voltage: 3.6,
        controller_start_current: 25,
        controller_current_loading_time: 0.2,
        controller_current_shedding_time: 0.5,
        controller_assist_levels: [
            { current_limit: 25, speed_limit: 100 },
            { current_limit: 30, speed_limit: 100 },
            { current_limit: 37, speed_limit: 100 },
            { current_limit: 45, speed_limit: 100 },
            { current_limit: 52, speed_limit: 100 },
            { current_limit: 60, speed_limit: 100 },
            { current_limit: 70, speed_limit: 100 },
            { current_limit: 80, speed_limit: 100 },
            { current_limit: 100, speed_limit: 100 },
        ],
        controller_displayless_mode: false,
        controller_lamps_always_on: false,
    };
}

export function getControllerParameter1ArrayDemo(): number[] {
    return [
        36, 18, 47, 128, 12, 172, 13, 16, 39, 3, 25, 15, 45, 0, 0, 24, 2, 12, 1,
        4, 1, 1, 66, 14, 204, 16, 0, 0, 0, 0, 0, 0, 0, 0, 12, 36, 0, 25, 2, 5,
        25, 30, 37, 45, 52, 60, 70, 80, 100, 100, 100, 100, 100, 100, 100, 100,
        100, 100, 0, 0, 94, 1, 255, 183,
    ];
}

export function getControllerParameter2Demo(): BafangCanControllerParameter2 {
    return {
        controller_torque_profiles: [
            {
                start_torque_value: 8,
                max_torque_value: 50,
                return_torque_value: 6,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 80,
                stop_delay: 180,
            },
            {
                start_torque_value: 6,
                max_torque_value: 45,
                return_torque_value: 5,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 80,
                stop_delay: 200,
            },
            {
                start_torque_value: 5,
                max_torque_value: 40,
                return_torque_value: 4,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 70,
                stop_delay: 180,
            },
            {
                start_torque_value: 4,
                max_torque_value: 32,
                return_torque_value: 3,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 60,
                stop_delay: 180,
            },
            {
                start_torque_value: 3,
                max_torque_value: 25,
                return_torque_value: 2,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 50,
                stop_delay: 170,
            },
            {
                start_torque_value: 2,
                max_torque_value: 18,
                return_torque_value: 2,
                min_current: 15,
                max_current: 100,
                start_pulse: 1,
                current_decay_time: 50,
                stop_delay: 150,
            },
        ],
    };
}

export function getControllerParameter2ArrayDemo(): number[] {
    return [
        8, 6, 5, 4, 3, 2, 50, 45, 40, 32, 25, 18, 6, 5, 4, 3, 2, 2, 100, 100,
        100, 100, 100, 100, 15, 15, 15, 15, 15, 15, 5, 5, 4, 4, 3, 3, 1, 1, 1,
        1, 1, 1, 16, 16, 14, 12, 10, 10, 90, 100, 90, 90, 85, 75, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 43,
    ];
}

export function getDisplayErrorCodesDemo(): number[] {
    return [14, 21, -1];
}

export function getControllerSpeedParametersDemo(): BafangCanControllerSpeedParameters {
    return {
        controller_wheel_diameter: BafangCanWheelDiameterTable[14],
        controller_speed_limit: 25,
        controller_circumference: 2224,
    };
}

export function getDisplayDemoData1(): BafangCanDisplayData1 {
    return {
        display_total_mileage: 10000,
        display_single_mileage: 1000,
        display_max_speed: 0,
    };
}

export function getDisplayDemoData2(): BafangCanDisplayData2 {
    return {
        display_average_speed: 0,
        display_service_mileage: 0,
    };
}

export function getControllerCodesDemo(): BafangCanControllerCodes {
    return {
        controller_hardware_version: 'CR X10V.350.FC 2.1',
        controller_software_version: 'CRX10VC3615E101004.0',
        controller_model_number: 'CR X10V.350.FC',
        controller_serial_number: 'CRX10V.350.FC2.1A42F5TB045999',
        controller_customer_number: '',
        controller_manufacturer: 'BAFANG',
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
    };
}

export function getBesstCodesDemo(): BafangBesstCodes {
    return {
        besst_hardware_version: 'BESST.UC 3.0.3',
        besst_software_version: 'BSF33.05',
        besst_serial_number: '',
    };
}
