import { WheelDiameterTable } from '../../../../constants/BafangCanConstants';
import { BesstReadedCanFrame } from '../../../../device/besst/besst-types';
import {
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanControllerSpeedParameters,
    SpeedSensorChannelNumber,
    SystemVoltage,
} from '../../../../types/BafangCanSystemTypes';
import { calculateChecksum } from '../../../../utils/can/utils';

export class BafangCanControllerParser {
    public static package0(
        packet: BesstReadedCanFrame,
    ): BafangCanControllerRealtime0 {
        const tmp = (packet.data[7] << 8) + packet.data[6];
        return {
            remaining_capacity: packet.data[0],
            single_trip: ((packet.data[2] << 8) + packet.data[1]) / 100,
            cadence: packet.data[3],
            torque: (packet.data[5] << 8) + packet.data[4],
            remaining_distance: tmp < 65535 ? tmp / 100 : null,
        };
    }

    public static package1(
        packet: BesstReadedCanFrame,
    ): BafangCanControllerRealtime1 {
        return {
            speed: ((packet.data[1] << 8) + packet.data[0]) / 100,
            current: ((packet.data[3] << 8) + packet.data[2]) / 100,
            voltage: ((packet.data[5] << 8) + packet.data[4]) / 100,
            temperature: packet.data[6] - 40,
            motor_temperature:
                packet.data[7] === 255 ? null : packet.data[7] - 40,
        };
    }

    public static parameter1(
        packet: BesstReadedCanFrame,
    ): BafangCanControllerParameter1 | null {
        if (packet.data[63] !== calculateChecksum(packet.data.slice(0, 63)))
            return null;
        const pkg: BafangCanControllerParameter1 = {
            system_voltage: packet.data[0] as SystemVoltage,
            current_limit: packet.data[1],
            overvoltage: packet.data[2],
            undervoltage: packet.data[3],
            undervoltage_under_load: packet.data[4],
            battery_recovery_voltage: packet.data[5],
            battery_capacity: (packet.data[8] << 8) + packet.data[7],
            max_current_on_low_charge: packet.data[9],
            full_capacity_range: packet.data[12],
            pedal_sensor_type: packet.data[13],
            coaster_brake: packet.data[14] === 1,
            pedal_sensor_signals_per_rotation: packet.data[15],
            speed_sensor_channel_number: packet
                .data[16] as SpeedSensorChannelNumber,
            motor_type: packet.data[18],
            motor_pole_pair_number: packet.data[19],
            speedmeter_magnets_number: packet.data[20],
            temperature_sensor_type: packet.data[21],
            deceleration_ratio:
                ((packet.data[23] << 8) + packet.data[22]) / 100,
            motor_max_rotor_rpm: (packet.data[25] << 8) + packet.data[24],
            motor_d_axis_inductance: (packet.data[27] << 8) + packet.data[26],
            motor_q_axis_inductance: (packet.data[29] << 8) + packet.data[28],
            motor_phase_resistance: (packet.data[31] << 8) + packet.data[30],
            motor_reverse_potential_coefficient:
                (packet.data[33] << 8) + packet.data[32],
            throttle_start_voltage: packet.data[34] / 10,
            throttle_max_voltage: packet.data[35] / 10,
            start_current: packet.data[37],
            current_loading_time: packet.data[38] / 10,
            current_shedding_time: packet.data[39] / 10,
            assist_levels: [],
            displayless_mode: packet.data[58] === 1,
            lamps_always_on: packet.data[59] === 1,
            walk_assist_speed: ((packet.data[61] << 8) + packet.data[60]) / 100,
        };
        for (let i = 0; i < 9; i++) {
            pkg.assist_levels.push({
                current_limit: packet.data[40 + i],
                speed_limit: packet.data[49 + i],
            });
        }
        return pkg;
    }

    public static parameter2(
        packet: BesstReadedCanFrame,
    ): BafangCanControllerParameter2 | null {
        if (packet.data[63] !== calculateChecksum(packet.data.slice(0, 63)))
            return null;
        const pkg: BafangCanControllerParameter2 = {
            torque_profiles: [],
        };
        for (let i = 0; i <= 5; i++) {
            pkg.torque_profiles.push({
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

    public static parameter3(
        packet: BesstReadedCanFrame,
    ): BafangCanControllerSpeedParameters | null {
        const diameter = WheelDiameterTable.find(
            (item) =>
                item.code[0] === packet.data[2] &&
                item.code[1] === packet.data[3],
        );
        if (diameter)
            return {
                speed_limit: ((packet.data[1] << 8) + packet.data[0]) / 100,
                wheel_diameter: diameter,
                circumference: (packet.data[5] << 8) + packet.data[4],
            };
        return null;
    }
}
