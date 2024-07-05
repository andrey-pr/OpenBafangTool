import BesstDevice from '../../device/besst/besst';
import {
    BesstReadedCanFrame,
    CanOperation,
} from '../../device/besst/besst-types';
import { PromiseControls } from '../../types/common';

type SentRequest = {
    promise: PromiseControls;
    can_operation: CanOperation;
};

export class RequestManager {
    private sentRequests: SentRequest[][][] = [];

    private besstDevice: BesstDevice;

    constructor(besstDevice: BesstDevice) {
        this.besstDevice = besstDevice;
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
                    this.besstDevice
                        .sendCanFrame(
                            source,
                            target,
                            can_operation,
                            code,
                            subcode,
                        )
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

    public resolveRequest(response: BesstReadedCanFrame, success = true): void {
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
