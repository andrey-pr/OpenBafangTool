import IGenericCanAdapter from '../../device/can/generic';
import { generateCanFrameId } from '../../device/high-level/bafang-can-utils';
import { CanOperation, ParsedCanFrame } from '../../types/BafangCanCommonTypes';
import { PromiseControls } from '../../types/common';

type SentRequest = {
    promise: PromiseControls;
    can_operation: CanOperation;
};

export class RequestManager {
    private sentRequests: SentRequest[][][] = [];

    private converterDevice: IGenericCanAdapter;

    constructor(converterDevice: IGenericCanAdapter) {
        this.converterDevice = converterDevice;
        this.registerRequest = this.registerRequest.bind(this);
        this.resolveRequest = this.resolveRequest.bind(this);
    }

    public registerRequest(
        source: number,
        target: number,
        can_operation: CanOperation,
        code: number,
        subcode: number,
        promise?: PromiseControls,
        attempt = 1,
    ): void {
        if (promise) {
            if (this.sentRequests[target] === undefined)
                this.sentRequests[target] = [];
            if (this.sentRequests[target][code] === undefined)
                this.sentRequests[target][code] = [];
            this.sentRequests[target][code][subcode] = {
                promise,
                can_operation,
            };
            setTimeout(() => {
                if (this.sentRequests[target][code][subcode]) {
                    if (
                        this.sentRequests[target][code][subcode]
                            .can_operation !== CanOperation.READ_CMD ||
                        attempt >= 3
                    ) {
                        promise.resolve(false);
                        return;
                    }
                    this.converterDevice
                        .sendCanFrame({
                            id: generateCanFrameId(
                                source,
                                target,
                                can_operation,
                                code,
                                subcode,
                            ),
                            data: [0],
                        })
                        .then(() =>
                            this.registerRequest(
                                source,
                                target,
                                can_operation,
                                code,
                                subcode,
                                promise,
                                ++attempt,
                            ),
                        );
                }
            }, 5000);
        }
    }

    public resolveRequest(response: ParsedCanFrame, success = true): void {
        if (
            this.sentRequests[response.sourceDeviceCode] &&
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ] &&
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode]
        ) {
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode].promise.resolve(success);
            delete this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode];
        }
    }
}
