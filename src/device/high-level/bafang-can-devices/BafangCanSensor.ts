import { deepCopy } from 'deep-copy-ts';
import { BafangCanSensorRealtime } from '../../../types/BafangCanSystemTypes';
import {
    getSensorHVDemo,
    getSensorMNDemo,
    getSensorRealtimeDemoData,
    getSensorSNDemo,
    getSensorSVDemo,
} from '../../../utils/can/demo_object_provider';
import BesstDevice from '../../besst/besst';
import { BesstReadedCanFrame } from '../../besst/besst-types';
import { DeviceNetworkId } from '../../besst/besst-types';
import { parseSensorPackage } from '../../../utils/can/parser';
import { charsToString } from '../../../utils/utils';
import log from 'electron-log/renderer';
import { RequestManager } from '../../../utils/can/RequestManager';
import EventEmitter from 'events';
import { readParameter, rereadParameter } from '../../../utils/can/utils';
import { CanReadCommandsList } from '../../../constants/BafangCanConstants';

export default class BafangCanSensor {
    private besstDevice?: BesstDevice;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

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
        besstDevice?: BesstDevice,
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
        this.besstDevice = besstDevice;
        this.requestManager = requestManager;
        this.emitter = new EventEmitter();
        this.besstDevice?.emitter.on('can', this.processParsedCanResponse);
        this.besstDevice?.emitter.on(
            'disconnection',
            () => (this.besstDevice = undefined),
        );
    }

    public connect() {
        this.besstDevice?.emitter.on('can', this.processParsedCanResponse);
        this.besstDevice?.emitter.on(
            'disconnection',
            () => (this.besstDevice = undefined),
        );
    }

    private processParsedCanResponse(response: BesstReadedCanFrame) {
        if (response.sourceDeviceCode !== DeviceNetworkId.TORQUE_SENSOR) return;
        this.device_available = true;
        this.requestManager?.resolveRequest(response);
        if (response.canCommandCode === 0x60) {
            log.info('received can package:', response);
            if (response.data.length === 0) {
                rereadParameter(response, this.besstDevice);
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
            this.realtime_data = parseSensorPackage(response);
            this.emitter.emit('data-0', deepCopy(this.realtime_data));
        }
    } // TODO

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
                readParameter(
                    DeviceNetworkId.TORQUE_SENSOR,
                    command,
                    this.besstDevice,
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
