import { BesstReadedCanFrame } from '../../device/besst/besst-types';
import {
    BafangCanAssistLevel,
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
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanSpeedSensorChannelNumber,
    BafangCanSystemVoltage,
    BafangCanWheelDiameterTable,
} from '../../types/BafangCanSystemTypes';
import { NotAvailable, NotLoadedYet } from '../../types/no_data';

function decodeCurrentAssistLevel(
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

export function parseErrorCodes(answer: BesstReadedCanFrame): number[] {
    const errors: number[] = [];
    let errorString = String.fromCharCode.apply(null, answer.data);
    while (errorString.length >= 2) {
        errors.push(parseInt(errorString.substring(0, 2)));
        errorString = errorString.substring(2);
    }
    return errors;
}

export function parseDisplayPackage0(
    packet: BesstReadedCanFrame,
): BafangCanDisplayState {
    return {
        display_assist_levels: packet.data[0] & 0b1111,
        display_ride_mode:
            packet.data[0] & 0b10000
                ? BafangCanRideMode.BOOST
                : BafangCanRideMode.ECO,
        display_boost: (packet.data[0] & 0b100000) >> 5 === 1,
        display_current_assist_level: decodeCurrentAssistLevel(
            packet.data[1],
            packet.data[0] & 0b1111,
        ),
        display_light: (packet.data[2] & 1) === 1,
        display_button: (packet.data[2] & 0b10) >> 1 === 1,
    };
}

export function parseDisplayPackage1(
    packet: BesstReadedCanFrame,
): BafangCanDisplayData1 {
    return {
        display_total_mileage:
            (packet.data[2] << 16) + (packet.data[1] << 8) + packet.data[0],
        display_single_mileage:
            ((packet.data[5] << 16) + (packet.data[4] << 8) + packet.data[3]) /
            10,
        display_max_speed: ((packet.data[7] << 8) + packet.data[6]) / 10,
    };
}

export function parseDisplayPackage2(
    packet: BesstReadedCanFrame,
): BafangCanDisplayData2 {
    return {
        display_average_speed: ((packet.data[1] << 8) + packet.data[0]) / 10,
        display_service_mileage:
            ((packet.data[4] << 16) + (packet.data[3] << 8) + packet.data[2]) /
            10,
    };
}

export function parseControllerPackage0(
    packet: BesstReadedCanFrame,
): BafangCanControllerRealtime0 {
    const tem = (packet.data[7] << 8) + packet.data[6];
    return {
        controller_remaining_capacity: packet.data[0],
        controller_single_trip: ((packet.data[2] << 8) + packet.data[1]) / 100,
        controller_cadence: packet.data[3],
        controller_torque: (packet.data[5] << 8) + packet.data[4],
        controller_remaining_distance: tem < 65535 ? tem / 100 : NotAvailable,
    };
}

export function parseControllerPackage1(
    packet: BesstReadedCanFrame,
): BafangCanControllerRealtime1 {
    return {
        controller_speed: ((packet.data[1] << 8) + packet.data[0]) / 100,
        controller_current: ((packet.data[3] << 8) + packet.data[2]) / 100,
        controller_voltage: ((packet.data[5] << 8) + packet.data[4]) / 100,
        controller_temperature: packet.data[6] - 40,
        controller_motor_temperature:
            packet.data[7] === 255 ? NotAvailable : packet.data[7] - 40,
    };
}

export function parseControllerPackage3(
    packet: BesstReadedCanFrame,
): BafangCanControllerSpeedParameters {
    const diameter = BafangCanWheelDiameterTable.find(
        (item) =>
            item.code[0] === packet.data[2] && item.code[1] === packet.data[3],
    );
    return {
        controller_speed_limit: ((packet.data[1] << 8) + packet.data[0]) / 100,
        controller_wheel_diameter: diameter ? diameter : NotLoadedYet,
        controller_circumference: (packet.data[5] << 8) + packet.data[4],
    };
}

export function parseControllerParameter1(
    packet: BesstReadedCanFrame,
): BafangCanControllerParameter1 {
    const pkg: BafangCanControllerParameter1 = {
        controller_system_voltage: packet.data[0] as BafangCanSystemVoltage,
        controller_current_limit: packet.data[1],
        controller_overvoltage: packet.data[2],
        controller_undervoltage: packet.data[3],
        controller_undervoltage_under_load: packet.data[4],
        controller_battery_recovery_voltage: packet.data[5],
        controller_battery_capacity: (packet.data[8] << 8) + packet.data[7],
        controller_max_current_on_low_charge: packet.data[9],
        controller_full_capacity_range: packet.data[12],
        controller_pedal_sensor_type: packet.data[13],
        controller_coaster_brake: packet.data[14] === 1,
        controller_pedal_sensor_signals_per_rotation: packet.data[15],
        controller_speed_sensor_channel_number: packet
            .data[16] as BafangCanSpeedSensorChannelNumber,
        controller_motor_type: packet.data[18],
        controller_motor_pole_pair_number: packet.data[19],
        controller_speedmeter_magnets_number: packet.data[20],
        controller_temperature_sensor_type: packet.data[21],
        controller_deceleration_ratio:
            ((packet.data[23] << 8) + packet.data[22]) / 100,
        controller_motor_max_rotor_rpm:
            (packet.data[25] << 8) + packet.data[24],
        controller_motor_d_axis_inductance:
            (packet.data[27] << 8) + packet.data[26],
        controller_motor_q_axis_inductance:
            (packet.data[29] << 8) + packet.data[28],
        controller_motor_phase_resistance:
            (packet.data[31] << 8) + packet.data[30],
        controller_motor_reverse_potential_coefficient:
            (packet.data[33] << 8) + packet.data[32],
        controller_throttle_start_voltage: packet.data[34] / 10,
        controller_throttle_max_voltage: packet.data[35] / 10,
        controller_start_current: packet.data[37],
        controller_current_loading_time: packet.data[38] / 10,
        controller_current_shedding_time: packet.data[39] / 10,
        controller_assist_levels: [],
        controller_displayless_mode: packet.data[58] === 1,
        controller_lamps_always_on: packet.data[59] === 1,
    };
    for (let i = 0; i < 9; i++) {
        pkg.controller_assist_levels.push({
            current_limit: packet.data[40 + i],
            speed_limit: packet.data[49 + i],
        });
    }
    return pkg;
}

export function parseControllerParameter2(
    packet: BesstReadedCanFrame,
): BafangCanControllerParameter2 {
    let pkg: BafangCanControllerParameter2 = { controller_torque_profiles: [] };
    for (let i = 0; i <= 5; i++) {
        pkg.controller_torque_profiles.push({
            start_torque_value: packet.data[0 + i],
            max_torque_value: packet.data[6 + i],
            return_torque_value: packet.data[12 + i],
            min_current: packet.data[24 + i],
            max_current: packet.data[18 + i],
            start_pulse: packet.data[36 + i],
            current_decay_time: packet.data[42 + i] * 5,
            stop_delay: packet.data[48 + i] * 2,
        });
    }
    return pkg;
}

export function parseSensorPackage(
    packet: BesstReadedCanFrame,
): BafangCanSensorRealtime {
    return {
        sensor_torque: (packet.data[1] << 8) + packet.data[0],
        sensor_cadence: packet.data[2],
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
