import { CanCommand } from '../../constants/BafangCanConstants';
import { CanFrame } from '../../device/can/can-types';
import IGenericCanAdapter from '../../device/can/generic';
import { generateCanFrameId } from '../../device/high-level/bafang-can-utils';
import {
    CanOperation,
    DeviceNetworkId,
    ParsedCanFrame,
} from '../../types/BafangCanCommonTypes';
import { PromiseControls } from '../../types/common';
import { RequestManager } from './RequestManager';

export function calculateChecksum(bytes: number[]): number {
    let summ = 0;
    bytes.forEach((item) => {
        summ += item;
    });
    return summ & 255;
}

export function rereadParameter(
    dto: ParsedCanFrame,
    device: IGenericCanAdapter,
): void {
    //TODO
    device.sendCanFrame({
        id: generateCanFrameId(
            DeviceNetworkId.BESST,
            dto.sourceDeviceCode,
            CanOperation.READ_CMD,
            dto.canCommandCode,
            dto.canCommandSubCode,
        ),
        data: [0],
    });
}

export function readParameter(
    target: DeviceNetworkId,
    can_command: CanCommand,
    device: IGenericCanAdapter,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    device
        .sendCanFrame({
            id: generateCanFrameId(
                DeviceNetworkId.BESST,
                target,
                CanOperation.READ_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
            ),
            data: [0],
        })
        .then(() =>
            requestManager.registerRequest(
                DeviceNetworkId.BESST,
                target,
                CanOperation.READ_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
                promise,
            ),
        );
}

export function writeShortParameter(
    target: DeviceNetworkId,
    can_command: CanCommand,
    data: number[],
    device: IGenericCanAdapter,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    device
        .sendCanFrame({
            id: generateCanFrameId(
                DeviceNetworkId.BESST,
                target,
                CanOperation.WRITE_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
            ),
            data,
        })
        .then(() =>
            requestManager.registerRequest(
                DeviceNetworkId.BESST,
                target,
                CanOperation.WRITE_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
                promise,
            ),
        );
}

export function writeLongParameter(
    target: DeviceNetworkId,
    can_command: CanCommand,
    value: number[],
    device: IGenericCanAdapter,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    let arrayClone = [...value];
    device.sendCanFrame({
        id: generateCanFrameId(
            DeviceNetworkId.BESST,
            target,
            CanOperation.WRITE_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
        ),
        data: [arrayClone.length],
    });
    device.sendCanFrame({
        id: generateCanFrameId(
            DeviceNetworkId.BESST,
            target,
            CanOperation.MULTIFRAME_START,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
        ),
        data: arrayClone.slice(0, 8),
    });
    arrayClone = arrayClone.slice(8);
    let packages = 0;
    do {
        device.sendCanFrame({
            id: generateCanFrameId(
                DeviceNetworkId.BESST,
                target,
                CanOperation.MULTIFRAME,
                0,
                packages++,
            ),
            data: arrayClone.slice(0, 8),
        });
        arrayClone = arrayClone.slice(8);
    } while (arrayClone.length > 8);
    device
        .sendCanFrame({
            id: generateCanFrameId(
                DeviceNetworkId.BESST,
                target,
                CanOperation.MULTIFRAME_END,
                0,
                packages,
            ),
            data: arrayClone.slice(0, 8),
        })
        .then(() =>
            requestManager.registerRequest(
                DeviceNetworkId.BESST,
                target,
                CanOperation.WRITE_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
                promise,
            ),
        );
}
