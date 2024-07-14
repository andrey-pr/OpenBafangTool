import { CanCommand } from "../../../../constants/BafangCanConstants";
import IGenericCanAdapter from "../../../../device/can/generic";
import { DeviceNetworkId } from "../../../../types/BafangCanCommonTypes";
import { PromiseControls } from "../../../../types/common";
import { RequestManager } from "../../../../utils/can/RequestManager";

export type WriteFunctionType = (
    target: DeviceNetworkId,
    can_command: CanCommand,
    value: number[],
    device: IGenericCanAdapter,
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
    converter_device: IGenericCanAdapter,
    request_manager: RequestManager,
): void {
    promise_array.push(
        new Promise<boolean>((resolve, reject) => {
            write_function(
                target,
                command,
                data,
                converter_device,
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
    converter_device: IGenericCanAdapter,
    request_manager: RequestManager,
): void {
    if (!value) return;
    addWritePromise(
        target_device,
        can_command,
        serializeString(value),
        promise_array,
        write_function,
        converter_device,
        request_manager,
    );
}
