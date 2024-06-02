import { deepCopy } from 'deep-copy-ts';
import {
    CanCommand,
    CanWriteCommandsList,
} from '../constants/BafangCanConstants';
import {
    BesstReadedCanFrame,
    DeviceNetworkId,
} from '../device/besst/besst-types';
import {
    BafangBesstCodes,
    BafangCanAssistLevel,
    BafangCanControllerCodes,
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
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
    BafangCanSpeedSensorChannelNumber,
    BafangCanSystemVoltage,
    BafangCanTemperatureSensorType,
    BafangCanWheelDiameterTable,
} from '../types/BafangCanSystemTypes';
import { NoData, NotAvailable, NotLoadedYet } from '../types/no_data';

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

export function processCodeAnswerFromController(
    answer: BesstReadedCanFrame,
    dto: BafangCanControllerCodes,
): void {
    switch (answer.canCommandSubCode) {
        case 0x00:
            dto.controller_hardware_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x01:
            dto.controller_software_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x02:
            dto.controller_model_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x03:
            dto.controller_serial_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x04:
            dto.controller_customer_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x05:
            dto.controller_manufacturer = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        default:
            break;
    }
}

export function processCodeAnswerFromDisplay(
    answer: BesstReadedCanFrame,
    dto: BafangCanDisplayCodes,
): void {
    switch (answer.canCommandSubCode) {
        case 0x00:
            dto.display_hardware_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x01:
            dto.display_software_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x02:
            dto.display_model_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x03:
            dto.display_serial_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x04:
            dto.display_customer_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x05:
            dto.display_manufacturer = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x08:
            dto.display_bootload_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        default:
            break;
    }
}

export function processCodeAnswerFromSensor(
    answer: BesstReadedCanFrame,
    dto: BafangCanSensorCodes,
): void {
    switch (answer.canCommandSubCode) {
        case 0x00:
            dto.sensor_hardware_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x01:
            dto.sensor_software_version = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x02:
            dto.sensor_model_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x03:
            dto.sensor_serial_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        case 0x04:
            dto.sensor_customer_number = String.fromCharCode.apply(
                null,
                answer.data,
            );
            break;
        default:
            break;
    }
}

export function decodeCurrentAssistLevel(
    currentAssistLevelCode: number,
    totalAssistLevels: number,
): BafangCanAssistLevel {
    const assistLevelTable: {
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
        totalAssistLevels !== 9
    ) {
        totalAssistLevels = 5;
    }
    return assistLevelTable[totalAssistLevels][currentAssistLevelCode];
}

export function validateTime(
    hours: number,
    minutes: number,
    seconds: number,
): boolean {
    return (
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59 &&
        seconds >= 0 &&
        seconds <= 59
    );
}

export function parseErrorCodes(
    answer: BesstReadedCanFrame,
    dto: number[],
): void {
    dto.splice(0, dto.length);
    let errorString = String.fromCharCode.apply(null, answer.data);
    while (errorString.length >= 2) {
        dto.push(parseInt(errorString.substring(0, 2)));
        errorString = errorString.substring(2);
    }
}

export function parseDisplayPackage0(
    packet: BesstReadedCanFrame,
    dto: BafangCanDisplayState,
): void {
    dto.display_assist_levels = packet.data[0] & 0b1111;
    (dto.display_ride_mode =
        packet.data[0] & 0b10000
            ? BafangCanRideMode.BOOST
            : BafangCanRideMode.ECO),
        (dto.display_boost = (packet.data[0] & 0b100000) >> 5 === 1);
    dto.display_current_assist_level = decodeCurrentAssistLevel(
        packet.data[1],
        packet.data[0] & 0b1111,
    );
    dto.display_light = (packet.data[2] & 1) === 1;
    dto.display_button = (packet.data[2] & 0b10) >> 1 === 1;
}

export function parseDisplayPackage1(
    packet: BesstReadedCanFrame,
    dto: BafangCanDisplayData,
): void {
    dto.display_total_mileage =
        (packet.data[2] << 16) + (packet.data[1] << 8) + packet.data[0];
    dto.display_single_mileage =
        ((packet.data[5] << 16) + (packet.data[4] << 8) + packet.data[3]) / 10;
    dto.display_max_speed = ((packet.data[7] << 8) + packet.data[6]) / 10;
}

export function parseDisplayPackage2(
    packet: BesstReadedCanFrame,
    dto: BafangCanDisplayData,
): void {
    dto.display_average_speed = ((packet.data[1] << 8) + packet.data[0]) / 10;
    dto.display_service_mileage =
        ((packet.data[4] << 16) + (packet.data[3] << 8) + packet.data[2]) / 10;
}

export function parseControllerPackage0(
    packet: BesstReadedCanFrame,
    dto: BafangCanControllerRealtime,
): void {
    const tem = (packet.data[7] << 8) + packet.data[6];
    dto.controller_remaining_capacity = packet.data[0];
    dto.controller_single_trip = ((packet.data[2] << 8) + packet.data[1]) / 100;
    dto.controller_cadence = packet.data[3];
    dto.controller_torque = (packet.data[5] << 8) + packet.data[4];
    dto.controller_remaining_distance = tem < 65535 ? tem / 100 : NotAvailable;
}

export function parseControllerPackage1(
    packet: BesstReadedCanFrame,
    dto: BafangCanControllerRealtime,
): void {
    dto.controller_speed = ((packet.data[1] << 8) + packet.data[0]) / 100;
    dto.controller_current = ((packet.data[3] << 8) + packet.data[2]) / 100;
    dto.controller_voltage = ((packet.data[5] << 8) + packet.data[4]) / 100;
    dto.controller_temperature = packet.data[6] - 40;
    dto.controller_motor_temperature =
        packet.data[7] === 255 ? NotAvailable : packet.data[7] - 40;
}

export function parseControllerPackage3(
    packet: BesstReadedCanFrame,
    dto: BafangCanControllerSpeedParameters,
): void {
    const diameter = BafangCanWheelDiameterTable.find(
        (item) =>
            item.code[0] === packet.data[2] && item.code[1] === packet.data[3],
    );
    dto.controller_speed_limit = ((packet.data[1] << 8) + packet.data[0]) / 100;
    if (diameter) dto.controller_wheel_diameter = diameter;
    dto.controller_circumference = (packet.data[5] << 8) + packet.data[4];
}

export function parseControllerParameter1(
    packet: BesstReadedCanFrame,
    dto: BafangCanControllerParameter1,
): void {
    dto.controller_system_voltage = packet.data[0] as BafangCanSystemVoltage;
    dto.controller_current_limit = packet.data[1];
    dto.controller_overvoltage = packet.data[2];
    dto.controller_undervoltage = packet.data[3];
    dto.controller_undervoltage_under_load = packet.data[4];
    dto.controller_battery_recovery_voltage = packet.data[5];
    dto.controller_battery_capacity = (packet.data[8] << 8) + packet.data[7];
    dto.controller_max_current_on_low_charge = packet.data[9];
    dto.controller_full_capacity_range = packet.data[12];
    dto.controller_pedal_sensor_type = packet.data[13];
    dto.controller_coaster_brake = packet.data[14] === 1;
    dto.controller_pedal_sensor_signals_per_rotation = packet.data[15];
    dto.controller_speed_sensor_channel_number = packet
        .data[16] as BafangCanSpeedSensorChannelNumber;
    dto.controller_motor_type = packet.data[18];
    dto.controller_motor_pole_pair_number = packet.data[19];
    dto.controller_speedmeter_magnets_number = packet.data[20];
    dto.controller_temperature_sensor_type = packet.data[21];
    dto.controller_deceleration_ratio =
        ((packet.data[23] << 8) + packet.data[22]) / 100;
    dto.controller_motor_max_rotor_rpm =
        (packet.data[25] << 8) + packet.data[24];
    dto.controller_motor_d_axis_inductance =
        (packet.data[27] << 8) + packet.data[26];
    dto.controller_motor_q_axis_inductance =
        (packet.data[29] << 8) + packet.data[28];
    dto.controller_motor_phase_resistance =
        (packet.data[31] << 8) + packet.data[30];
    dto.controller_motor_reverse_potential_coefficient =
        (packet.data[33] << 8) + packet.data[32];
    dto.controller_throttle_start_voltage = packet.data[34] / 10;
    dto.controller_throttle_max_voltage = packet.data[35] / 10;
    dto.controller_start_current = packet.data[37];
    dto.controller_current_loading_time = packet.data[38] / 10;
    dto.controller_current_shedding_time = packet.data[39] / 10;
    dto.controller_assist_levels = [
        { current_limit: packet.data[40], speed_limit: packet.data[49] },
        { current_limit: packet.data[41], speed_limit: packet.data[50] },
        { current_limit: packet.data[42], speed_limit: packet.data[51] },
        { current_limit: packet.data[43], speed_limit: packet.data[52] },
        { current_limit: packet.data[44], speed_limit: packet.data[53] },
        { current_limit: packet.data[45], speed_limit: packet.data[54] },
        { current_limit: packet.data[46], speed_limit: packet.data[55] },
        { current_limit: packet.data[47], speed_limit: packet.data[56] },
        { current_limit: packet.data[48], speed_limit: packet.data[57] },
    ];
    dto.controller_displayless_mode = packet.data[58] === 1;
    dto.controller_lamps_always_on = packet.data[59] === 1;
}

export function parseControllerParameter2(
    packet: BesstReadedCanFrame,
    dto: BafangCanControllerParameter2,
): void {
    for (let i = 0; i <= 5; i++) {
        dto.controller_torque_profiles[i] = {
            start_torque_value: packet.data[0 + i],
            max_torque_value: packet.data[6 + i],
            return_torque_value: packet.data[12 + i],
            min_current: packet.data[24 + i],
            max_current: packet.data[18 + i],
            start_pulse: packet.data[36 + i],
            current_decay_time: packet.data[42 + i] * 5,
            stop_delay: packet.data[48 + i] * 2,
        };
    }
}

export function parseSensorPackage(
    packet: BesstReadedCanFrame,
    dto: BafangCanSensorRealtime,
): void {
    dto.sensor_torque = (packet.data[1] << 8) + packet.data[0];
    dto.sensor_cadence = packet.data[2];
}

export function serializeMileage(mileage: number): number[] {
    return [
        mileage & 0b11111111,
        (mileage & 0b1111111100000000) >> 8,
        (mileage & 0b111111110000000000000000) >> 16,
    ];
}

export function serializeString(value: string): number[] {
    return [...Buffer.from(value), 0];
}

export function prepareStringWritePromise(
    value: string | NoData,
    device: DeviceNetworkId,
    can_command: CanCommand,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (typeof value !== 'string') return;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                device,
                can_command,
                serializeString(value),
                resolve,
                reject,
            );
        }),
    );
}

export function prepareParameter1WritePromise(
    value: BafangCanControllerParameter1,
    old_pkg: number[] | undefined,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (!old_pkg) return;
    const new_pkg: number[] = deepCopy(old_pkg);
    new_pkg[1] = value.controller_current_limit;
    new_pkg[2] = value.controller_overvoltage;
    new_pkg[3] = value.controller_undervoltage;
    new_pkg[4] = value.controller_undervoltage_under_load;
    new_pkg[7] = value.controller_battery_capacity & 0b11111111;
    new_pkg[8] = value.controller_battery_capacity >> 8;
    new_pkg[9] = value.controller_max_current_on_low_charge;
    new_pkg[12] = value.controller_full_capacity_range;
    new_pkg[13] = value.controller_pedal_sensor_type;
    new_pkg[20] = value.controller_speedmeter_magnets_number;
    new_pkg[34] = value.controller_throttle_start_voltage * 10;
    new_pkg[35] = value.controller_throttle_max_voltage * 10;
    new_pkg[37] = value.controller_start_current;
    new_pkg[38] = value.controller_current_loading_time * 10;
    new_pkg[39] = value.controller_current_shedding_time * 10;
    new_pkg[40] = value.controller_assist_levels[0].current_limit;
    new_pkg[41] = value.controller_assist_levels[1].current_limit;
    new_pkg[42] = value.controller_assist_levels[2].current_limit;
    new_pkg[43] = value.controller_assist_levels[3].current_limit;
    new_pkg[44] = value.controller_assist_levels[4].current_limit;
    new_pkg[45] = value.controller_assist_levels[5].current_limit;
    new_pkg[46] = value.controller_assist_levels[6].current_limit;
    new_pkg[47] = value.controller_assist_levels[7].current_limit;
    new_pkg[48] = value.controller_assist_levels[8].current_limit;
    new_pkg[49] = value.controller_assist_levels[0].speed_limit;
    new_pkg[50] = value.controller_assist_levels[1].speed_limit;
    new_pkg[51] = value.controller_assist_levels[2].speed_limit;
    new_pkg[52] = value.controller_assist_levels[3].speed_limit;
    new_pkg[53] = value.controller_assist_levels[4].speed_limit;
    new_pkg[54] = value.controller_assist_levels[5].speed_limit;
    new_pkg[55] = value.controller_assist_levels[6].speed_limit;
    new_pkg[56] = value.controller_assist_levels[7].speed_limit;
    new_pkg[57] = value.controller_assist_levels[8].speed_limit;
    new_pkg[58] = value.controller_displayless_mode ? 1 : 0;
    new_pkg[59] = value.controller_lamps_always_on ? 1 : 0;
    let summ = 0;
    new_pkg.slice(0, 63).forEach((item) => (summ += item));
    new_pkg[63] = summ & 0b11111111;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.Parameter1,
                new_pkg,
                resolve,
                reject,
            );
        }),
    );
}

export function prepareParameter2WritePromise(
    value: BafangCanControllerParameter2,
    old_pkg: number[] | undefined,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (!old_pkg) return;
    const new_pkg: number[] = deepCopy(old_pkg);
    for (let i = 0; i <= 5; i++) {
        new_pkg[0 + i] = value.controller_torque_profiles[i].start_torque_value;
        new_pkg[6 + i] = value.controller_torque_profiles[i].max_torque_value;
        new_pkg[12 + i] =
            value.controller_torque_profiles[i].return_torque_value;
        new_pkg[24 + i] = value.controller_torque_profiles[i].min_current;
        new_pkg[18 + i] = value.controller_torque_profiles[i].max_current;
        new_pkg[36 + i] = value.controller_torque_profiles[i].start_pulse;
        new_pkg[42 + i] = Math.floor(
            value.controller_torque_profiles[i].current_decay_time / 5,
        );
        new_pkg[48 + i] = Math.floor(
            value.controller_torque_profiles[i].stop_delay / 2,
        );
    }
    let summ = 0;
    new_pkg.slice(0, 63).forEach((item) => (summ += item));
    new_pkg[63] = summ & 0b11111111;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.Parameter1,
                new_pkg,
                resolve,
                reject,
            );
        }),
    );
}

export function prepareSpeedPackageWritePromise(
    value: BafangCanControllerSpeedParameters,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (
        !value.controller_circumference ||
        typeof value.controller_speed_limit !== 'number' ||
        typeof value.controller_circumference !== 'number' ||
        !value.controller_wheel_diameter ||
        !value.controller_wheel_diameter.code
    )
        return;
    const limit = value.controller_speed_limit * 100;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.MotorSpeedParameters,
                [
                    limit & 0b11111111,
                    (limit & 0b1111111100000000) >> 8,
                    value.controller_wheel_diameter.code[0],
                    value.controller_wheel_diameter.code[1],
                    value.controller_circumference as number & 0b11111111,
                    (value.controller_circumference as number &
                        0b1111111100000000) >> 8,
                ],
                resolve,
                reject,
            );
        }),
    );
}

export function prepareTotalMileageWritePromise(
    value: number | NoData,
    can_command: CanCommand,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (typeof value !== 'number') return;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                DeviceNetworkId.DISPLAY,
                can_command,
                serializeMileage(value),
                resolve,
                reject,
            );
        }),
    );
}

export function prepareSingleMileageWritePromise(
    value: number | NoData,
    can_command: CanCommand,
    promise_array: Promise<boolean>[],
    write_function: (
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ) => void,
): void {
    if (typeof value !== 'number') return;
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                DeviceNetworkId.DISPLAY,
                can_command,
                serializeMileage(value * 10),
                resolve,
                reject,
            );
        }),
    );
}
