import { CanOperation, DeviceNetworkId, ParsedCanFrame } from "../../types/BafangCanCommonTypes";
import { CanFrame } from "../can/can-types";

export function generateCanFrameId(
    source: DeviceNetworkId,
    target: DeviceNetworkId,
    canOperationCode: CanOperation,
    canCommandCode: number,
    canCommandSubCode: number,
): number[] {
    return [
        source & 0b11111,
        ((target & 0b11111) << 3) + (canOperationCode & 0b111),
        canCommandCode,
        canCommandSubCode,
    ];
}

export function parseCanFrame(frame: CanFrame): ParsedCanFrame {
    return {
        canCommandCode: frame.id[2],
        canCommandSubCode: frame.id[3],
        canOperationCode: frame.id[1] & 0b111,
        sourceDeviceCode: frame.id[0],
        targetDeviceCode: (frame.id[1] & 0b11111000) >> 3,
        data: frame.data,
    };
}