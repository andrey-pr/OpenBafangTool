import { CanCommand } from '../../constants/BafangCanConstants';
import BesstDevice from '../../device/besst/besst';
import {
    BesstReadedCanFrame,
    CanOperation,
    DeviceNetworkId,
} from '../../device/besst/besst-types';
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
    dto: BesstReadedCanFrame,
    device: BesstDevice,
): void {
    //TODO
    device.sendCanFrame(
        DeviceNetworkId.BESST,
        dto.sourceDeviceCode,
        CanOperation.READ_CMD,
        dto.canCommandCode,
        dto.canCommandSubCode,
    );
}

export function readParameter(
    target: DeviceNetworkId,
    can_command: CanCommand,
    device: BesstDevice,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    device
        .sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.READ_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
        )
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
    value: number[],
    device: BesstDevice,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    device
        .sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.WRITE_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
            value,
        )
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
    device: BesstDevice,
    requestManager: RequestManager,
    promise?: PromiseControls,
): void {
    let arrayClone = [...value];
    device.sendCanFrame(
        DeviceNetworkId.BESST,
        target,
        CanOperation.WRITE_CMD,
        can_command.canCommandCode,
        can_command.canCommandSubCode,
        [arrayClone.length],
    );
    device.sendCanFrame(
        DeviceNetworkId.BESST,
        target,
        CanOperation.MULTIFRAME_START,
        can_command.canCommandCode,
        can_command.canCommandSubCode,
        arrayClone.slice(0, 8),
    );
    arrayClone = arrayClone.slice(8);
    let packages = 0;
    do {
        device.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.MULTIFRAME,
            0,
            packages++,
            arrayClone.slice(0, 8),
        );
        arrayClone = arrayClone.slice(8);
    } while (arrayClone.length > 8);
    device
        .sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.MULTIFRAME_END,
            0,
            packages,
            arrayClone.slice(0, 8),
        )
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
