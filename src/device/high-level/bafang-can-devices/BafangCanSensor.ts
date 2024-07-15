import { deepCopy } from 'deep-copy-ts';
import { BafangCanSensorRealtime } from '../../../types/BafangCanSystemTypes';
import {
    getSensorHVDemo,
    getSensorMNDemo,
    getSensorRealtimeDemoData,
    getSensorSNDemo,
    getSensorSVDemo,
} from '../../../utils/can/demo_object_provider';
import { charsToString } from '../../../utils/utils';
import log from 'electron-log/renderer';
import { RequestManager } from '../../../utils/can/RequestManager';
import EventEmitter from 'events';
import {
    readParameter,
    rereadParameter,
} from '../../../utils/can/utils';
import { CanReadCommandsList } from '../../../constants/BafangCanConstants';
import { BafangCanSensorParser } from '../../../parser/bafang/can/parser/Sensor';
import {
    DeviceNetworkId,
    ParsedCanFrame,
} from '../../../types/BafangCanCommonTypes';
import IGenericCanAdapter from '../../can/generic';
import { parseCanFrame } from '../bafang-can-utils';

export default class BafangCanSensor {
    private converterDevice?: IGenericCanAdapter;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

    private can_emitter?: EventEmitter;

    private readingInProgress: boolean = false;

    private device_available: boolean = false;

    private demo: boolean;

    private realtime_data: BafangCanSensorRealtime | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    constructor(
        demo: boolean,
        can_emitter?: EventEmitter,
        converterDevice?: IGenericCanAdapter,
        requestManager?: RequestManager,
    ) {
        if (demo) {
            this.realtime_data = getSensorRealtimeDemoData();
            this.serial_number = getSensorSNDemo();
            this.software_version = getSensorSVDemo();
            this.hardware_version = getSensorHVDemo();
            this.model_number = getSensorMNDemo();
        }
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.demo = demo;
        this.converterDevice = converterDevice;
        this.requestManager = requestManager;
        this.can_emitter = can_emitter;
        this.emitter = new EventEmitter();
        this.can_emitter?.on('can', (parsed_frame) =>
            this.processParsedCanResponse(parsed_frame),
        );
        this.converterDevice?.emitter.on(
            'disconnection',
            () => (this.converterDevice = undefined),
        );
    }

    public connect() {
        this.can_emitter?.on('can', (parsed_frame) =>
            this.processParsedCanResponse(parsed_frame),
        );
        this.converterDevice?.emitter.on(
            'disconnection',
            () => (this.converterDevice = undefined),
        );
    }

    private processParsedCanResponse(response: ParsedCanFrame) {
        if (
            !this.converterDevice ||
            response.sourceDeviceCode !== DeviceNetworkId.TORQUE_SENSOR
        )
            return;
        this.device_available = true;
        this.requestManager?.resolveRequest(response);
        if (response.canCommandCode === 0x60) {
            log.info('received can package:', response);
            if (response.data.length === 0) {
                rereadParameter(response, this.converterDevice);
                return;
            }
            switch (response.canCommandSubCode) {
                case 0x00:
                    this.hardware_version = charsToString(response.data);
                    this.emitter.emit('data-hv', this.hardware_version);
                    break;
                case 0x01:
                    this.software_version = charsToString(response.data);
                    this.emitter.emit('data-sv', this.software_version);
                    break;
                case 0x02:
                    this.model_number = charsToString(response.data);
                    this.emitter.emit('data-mn', this.model_number);
                    break;
                case 0x03:
                    this.serial_number = charsToString(response.data);
                    this.emitter.emit('data-sn', this.serial_number);
                    break;
                default:
                    break;
            }
        } else if (
            response.canCommandCode === 0x31 &&
            response.canCommandSubCode === 0x00
        ) {
            this.realtime_data = BafangCanSensorParser.package0(response);
            this.emitter.emit('data-0', deepCopy(this.realtime_data));
        }
    }

    public loadData(): void {
        if (this.demo) {
            setTimeout(() => {
                this.emitter.emit('data-hv', this.hardware_version);
                this.emitter.emit('data-sv', this.software_version);
                this.emitter.emit('data-mn', this.model_number);
                this.emitter.emit('data-sn', this.serial_number);
                this.emitter.emit('data-0', deepCopy(this.realtime_data));
                this.device_available = true;
                this.emitter.emit('read-finish', 4, 0);
            }, 1500);
            console.log('Demo mode: blank data loaded');
            return;
        }
        if (this.readingInProgress) return;
        this.readingInProgress = true;
        const commands = [
            CanReadCommandsList.HardwareVersion,
            CanReadCommandsList.SoftwareVersion,
            CanReadCommandsList.ModelNumber,
            CanReadCommandsList.SerialNumber,
        ];
        let readedSuccessfully = 0,
            readedNonSuccessfully = 0;

        commands.forEach((command) => {
            new Promise<boolean>((resolve, reject) => {
                if (!this.converterDevice || !this.requestManager) return;
                readParameter(
                    DeviceNetworkId.TORQUE_SENSOR,
                    command,
                    this.converterDevice,
                    this.requestManager,
                    { resolve, reject },
                );
            }).then((success) => {
                if (success) readedSuccessfully++;
                else readedNonSuccessfully++;
                if (
                    readedSuccessfully + readedNonSuccessfully >=
                    commands.length
                ) {
                    this.emitter.emit(
                        'read-finish',
                        readedSuccessfully,
                        readedNonSuccessfully,
                    );
                    this.readingInProgress = false;
                }
            });
        });
    }

    public get available(): boolean {
        return this.device_available;
    }

    public get realtimeData(): BafangCanSensorRealtime | null {
        return deepCopy(this.realtime_data);
    }

    public get serialNumber(): string | null {
        return this.serial_number;
    }

    public get hardwareVersion(): string | null {
        return this.hardware_version;
    }

    public get softwareVersion(): string | null {
        return this.software_version;
    }

    public get modelNumber(): string | null {
        return this.model_number;
    }
}
