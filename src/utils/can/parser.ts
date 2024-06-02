import { BesstReadedCanFrame } from '../../device/besst/besst-types';
import {
    BafangCanAssistLevel,
    BafangCanControllerCodes,
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanSpeedSensorChannelNumber,
    BafangCanSystemVoltage,
    BafangCanWheelDiameterTable,
} from '../../types/BafangCanSystemTypes';
import { NotAvailable } from '../../types/no_data';

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
