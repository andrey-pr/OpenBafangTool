import { CanCommand } from "../../../../constants/BafangCanConstants";
import BesstDevice from "../../../../device/besst/besst";
import { DeviceNetworkId } from "../../../../device/besst/besst-types";
import { PromiseControls } from "../../../../types/common";
import { RequestManager } from "../../../../utils/can/RequestManager";

export type WriteFunctionType = (
    target: DeviceNetworkId,
    can_command: CanCommand,
    value: number[],
    device: BesstDevice,
    request_manager: RequestManager,
    promise?: PromiseControls,
) => void;

function serializeString(value: string): number[] {
    return [...Buffer.from(value), 0];
}

export function addWritePromise(
    target: DeviceNetworkId,
    command: CanCommand,
    data: number[],
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    besst_device: BesstDevice,
    request_manager: RequestManager,
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
    besst_device: BesstDevice,
    request_manager: RequestManager,
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
