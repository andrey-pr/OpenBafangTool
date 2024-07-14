import { CanWriteCommandsList } from "../../../../constants/BafangCanConstants";
import IGenericCanAdapter from "../../../../device/can/generic";
import { DeviceNetworkId } from "../../../../types/BafangCanCommonTypes";
import { RequestManager } from "../../../../utils/can/RequestManager";
import { intToByteArray } from "../../../../utils/utils";
import { WriteFunctionType, addWritePromise } from "./common";

function serializeMileage(mileage: number): number[] {
    return intToByteArray(mileage, 3);
}

export function prepareTotalMileageWritePromise(
    value: number | null | undefined,
    promise_array: Promise<boolean>[],
    write_function: WriteFunctionType,
    device: IGenericCanAdapter,
    request_manager: RequestManager,
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
    device: IGenericCanAdapter,
    request_manager: RequestManager,
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
