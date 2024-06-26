import { deepCopy } from 'deep-copy-ts';
import {
    CanCommand,
    CanWriteCommandsList,
} from '../../constants/BafangCanConstants';
import { DeviceNetworkId } from '../../device/besst/besst-types';
import {
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerSpeedParameters,
} from '../../types/BafangCanSystemTypes';
import { intToByteArray } from '../utils';
import { calculateChecksum } from './utils';
import { PromiseControls } from '../../types/common';
import BesstDevice from '../../device/besst/besst';
import { RequestManager } from './RequestManager';

type WriteFunctionType = (
    target: DeviceNetworkId,
    can_command: CanCommand,
    value: number[],
    device?: BesstDevice,
    request_manager?: RequestManager,
    promise?: PromiseControls,
) => void;

function serializeMileage(mileage: number): number[] {
    return intToByteArray(mileage, 3);
}

function serializeString(value: string): number[] {
    return [...Buffer.from(value), 0];
}

function addWritePromise(
    target: DeviceNetworkId,
    command: CanCommand,
    data: number[],
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device?: BesstDevice,
    request_manager?: RequestManager,
): void {
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                target,
                command,
                data,
                besst_device,
                request_manager,
                { resolve, reject },
            );
        }),
    );
}

export function prepareStringWritePromise(
    value: string | null | undefined,
    target_device: DeviceNetworkId,
    can_command: CanCommand,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device?: BesstDevice,
    request_manager?: RequestManager,
): void {
    if (!value) return;
    addWritePromise(
        target_device,
        can_command,
        serializeString(value),
        promise_array,
        write_function,
        besst_device,
        request_manager,
    );
}

export function prepareParameter1WritePromise(
    value: BafangCanControllerParameter1,
    old_pkg: number[] | undefined,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device?: BesstDevice,
    request_manager?: RequestManager,
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
    if (value.controller_assist_levels.length !== 9) return;
    value.controller_assist_levels.forEach((profile, index) => {
        new_pkg[40 + index] = profile.current_limit;
        new_pkg[48 + index] = profile.speed_limit;
    });
    new_pkg[58] = value.controller_displayless_mode ? 1 : 0;
    new_pkg[59] = value.controller_lamps_always_on ? 1 : 0;
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
    value: BafangCanControllerParameter2,
    old_pkg: number[] | undefined,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device?: BesstDevice,
    request_manager?: RequestManager,
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
    value: BafangCanControllerSpeedParameters,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device?: BesstDevice,
    request_manager?: RequestManager,
): void {
    const data = [
        ...intToByteArray(value.controller_speed_limit * 100, 2),
        value.controller_wheel_diameter.code[0],
        value.controller_wheel_diameter.code[1],
        ...intToByteArray(value.controller_circumference as number, 2),
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

export function prepareTotalMileageWritePromise(
    value: number | null | undefined,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    device?: BesstDevice,
    request_manager?: RequestManager,
): void {
    if (!value) return;
    addWritePromise(
        DeviceNetworkId.DISPLAY,
        CanWriteCommandsList.DisplayTotalMileage,
        serializeMileage(value),
        promise_array,
        write_function,
        device,
        request_manager,
    );
}

export function prepareSingleMileageWritePromise(
    value: number | null | undefined,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    device?: BesstDevice,
    request_manager?: RequestManager,
): void {
    if (!value) return;
    addWritePromise(
        DeviceNetworkId.DISPLAY,
        CanWriteCommandsList.DisplaySingleMileage,
        serializeMileage(value * 10),
        promise_array,
        write_function,
        device,
        request_manager,
    );
}
