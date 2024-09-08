import { deepCopy } from 'deep-copy-ts';
import {
    CanCommand,
    CanWriteCommandsList,
} from '../../../../constants/BafangCanConstants';
import BesstDevice from '../../../../device/besst/besst';
import { DeviceNetworkId } from '../../../../device/besst/besst-types';
import {
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerSpeedParameters,
} from '../../../../types/BafangCanSystemTypes';
import { RequestManager } from '../../../../utils/can/RequestManager';
import { WriteFunctionType, addWritePromise } from './common';
import { calculateChecksum } from '../../../../utils/can/utils';
import { intToByteArray } from '../../../../utils/utils';

export function prepareParameter1WritePromise(
    value: BafangCanControllerParameter1 | null,
    old_pkg: number[] | null,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device: BesstDevice,
    request_manager: RequestManager,
): void {
    if (!old_pkg || !value) return;
    const new_pkg: number[] = deepCopy(old_pkg);
    new_pkg[1] = value.current_limit;
    new_pkg[2] = value.overvoltage;
    new_pkg[3] = value.undervoltage;
    new_pkg[4] = value.undervoltage_under_load;
    new_pkg[7] = value.battery_capacity & 0b11111111;
    new_pkg[8] = value.battery_capacity >> 8;
    new_pkg[9] = value.max_current_on_low_charge;
    new_pkg[12] = value.full_capacity_range;
    new_pkg[13] = value.pedal_sensor_type;
    new_pkg[20] = value.speedmeter_magnets_number;
    new_pkg[34] = value.throttle_start_voltage * 10;
    new_pkg[35] = value.throttle_max_voltage * 10;
    new_pkg[37] = value.start_current;
    new_pkg[38] = value.current_loading_time * 10;
    new_pkg[39] = value.current_shedding_time * 10;
    if (value.assist_levels.length !== 9) return;
    value.assist_levels.forEach((profile, index) => {
        new_pkg[40 + index] = profile.current_limit;
        new_pkg[48 + index] = profile.speed_limit;
    });
    new_pkg[58] = value.displayless_mode ? 1 : 0;
    new_pkg[59] = value.lamps_always_on ? 1 : 0;
    new_pkg[60] = (value.walk_assist_speed * 100) & 0b11111111;
    new_pkg[61] = (value.walk_assist_speed * 100) >> 8;
    new_pkg[63] = calculateChecksum(new_pkg.slice(0, 63));
    addWritePromise(
        DeviceNetworkId.DRIVE_UNIT,
        CanWriteCommandsList.Parameter1,
        new_pkg,
        promise_array,
        write_function,
        besst_device,
        request_manager,
    );
}

export function prepareParameter2WritePromise(
    value: BafangCanControllerParameter2 | null,
    old_pkg: number[] | null,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device: BesstDevice,
    request_manager: RequestManager,
): void {
    if (!old_pkg || !value) return;
    const new_pkg: number[] = deepCopy(old_pkg);
    for (let i = 0; i <= 5; i++) {
        new_pkg[0 + i] = value.torque_profiles[i].start_torque_value;
        new_pkg[6 + i] = value.torque_profiles[i].max_torque_value;
        new_pkg[12 + i] = value.torque_profiles[i].return_torque_value;
        new_pkg[24 + i] = value.torque_profiles[i].min_current;
        new_pkg[18 + i] = value.torque_profiles[i].max_current;
        new_pkg[36 + i] = value.torque_profiles[i].start_pulse;
        new_pkg[42 + i] = Math.floor(
            value.torque_profiles[i].current_decay_time / 5,
        );
        new_pkg[48 + i] = Math.floor(value.torque_profiles[i].stop_delay / 2);
    }
    new_pkg[63] = calculateChecksum(new_pkg.slice(0, 63));
    addWritePromise(
        DeviceNetworkId.DRIVE_UNIT,
        CanWriteCommandsList.Parameter2,
        new_pkg,
        promise_array,
        write_function,
        besst_device,
        request_manager,
    );
}

export function prepareSpeedPackageWritePromise(
    value: BafangCanControllerSpeedParameters | null,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device: BesstDevice,
    request_manager: RequestManager,
): void {
    if (!value) return;
    const data = [
        ...intToByteArray(value.speed_limit * 100, 2),
        value.wheel_diameter.code[0],
        value.wheel_diameter.code[1],
        ...intToByteArray(value.circumference as number, 2),
    ];
    addWritePromise(
        DeviceNetworkId.DRIVE_UNIT,
        CanWriteCommandsList.MotorSpeedParameters,
        data,
        promise_array,
        write_function,
        besst_device,
        request_manager,
    );
}
