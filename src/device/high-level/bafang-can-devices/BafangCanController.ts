import { deepCopy } from 'deep-copy-ts';
import log from 'electron-log/renderer';
import { RequestManager } from '../../../utils/can/RequestManager';
import EventEmitter from 'events';
import {
    readParameter,
    rereadParameter,
    writeLongParameter,
    writeShortParameter,
} from '../../../utils/can/utils';
import {
    CanReadCommandsList,
    CanWriteCommandsList,
} from '../../../constants/BafangCanConstants';
import {
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanControllerSpeedParameters,
} from '../../../types/BafangCanSystemTypes';
import {
    getControllerHVDemo,
    getControllerMNDemo,
    getControllerManufacturerDemo,
    getControllerParameter1ArrayDemo,
    getControllerParameter1Demo,
    getControllerParameter2ArrayDemo,
    getControllerParameter2Demo,
    getControllerRealtime0DemoData,
    getControllerRealtime1DemoData,
    getControllerSNDemo,
    getControllerSVDemo,
    getControllerSpeedParametersDemo,
} from '../../../utils/can/demo_object_provider';
import { charsToString } from '../../../utils/utils';
import { BafangCanControllerParser } from '../../../parser/bafang/can/parser/Controller';
import { prepareStringWritePromise } from '../../../parser/bafang/can/serializer/common';
import {
    prepareParameter1WritePromise,
    prepareParameter2WritePromise,
    prepareSpeedPackageWritePromise,
} from '../../../parser/bafang/can/serializer/Controller';
import { DeviceNetworkId, ReadedCanFrame } from '../../../types/BafangCanCommonTypes';
import IGenericCanAdapter from '../../can/generic';

export default class BafangCanController {
    private converterDevice?: IGenericCanAdapter;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

    private readingInProgress: boolean = false;

    private device_available: boolean = false;

    private demo: boolean;

    private realtime_data_0: BafangCanControllerRealtime0 | null = null;

    private realtime_data_1: BafangCanControllerRealtime1 | null = null;

    private parameter_1: BafangCanControllerParameter1 | null = null;

    private parameter_2: BafangCanControllerParameter2 | null = null;

    private parameter_1_array: number[] | null = null;

    private parameter_2_array: number[] | null = null;

    private speed_parameter: BafangCanControllerSpeedParameters | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    private _manufacturer: string | null = null;

    constructor(
        demo: boolean,
        converterDevice?: IGenericCanAdapter,
        requestManager?: RequestManager,
    ) {
        if (demo) {
            this.realtime_data_0 = getControllerRealtime0DemoData();
            this.realtime_data_1 = getControllerRealtime1DemoData();
            this.parameter_1 = getControllerParameter1Demo();
            this.parameter_2 = getControllerParameter2Demo();
            this.parameter_1_array = getControllerParameter1ArrayDemo();
            this.parameter_2_array = getControllerParameter2ArrayDemo();
            this.speed_parameter = getControllerSpeedParametersDemo();
            this.serial_number = getControllerSNDemo();
            this.software_version = getControllerSVDemo();
            this.hardware_version = getControllerHVDemo();
            this.model_number = getControllerMNDemo();
            this._manufacturer = getControllerManufacturerDemo();
        }
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.demo = demo;
        this.converterDevice = converterDevice;
        this.requestManager = requestManager;
        this.emitter = new EventEmitter();
        this.converterDevice?.emitter.on('can', this.processParsedCanResponse);
        this.converterDevice?.emitter.on(
            'disconnection',
            () => (this.converterDevice = undefined),
        );
    }

    public connect() {
        this.converterDevice?.emitter.on('can', this.processParsedCanResponse);
        this.converterDevice?.emitter.on(
            'disconnection',
            () => (this.converterDevice = undefined),
        );
    }

    private processParsedCanResponse(response: ReadedCanFrame) {
        if (
            !this.converterDevice ||
            response.sourceDeviceCode !== DeviceNetworkId.DRIVE_UNIT
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
                case 0x05:
                    this._manufacturer = charsToString(response.data);
                    this.emitter.emit('data-m', this._manufacturer);
                    break;
                case 0x11:
                    this.parameter_1_array = response.data;
                    this.parameter_1 =
                        BafangCanControllerParser.parameter1(response);
                    this.emitter.emit('data-p1', deepCopy(this.parameter_1));
                    break;
                case 0x12:
                    this.parameter_2_array = response.data;
                    this.parameter_2 =
                        BafangCanControllerParser.parameter2(response);
                    this.emitter.emit('data-p2', deepCopy(this.parameter_2));
                    break;
                default:
                    break;
            }
        } else if (response.canCommandCode === 0x32) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    this.realtime_data_0 =
                        BafangCanControllerParser.package0(response);
                    this.emitter.emit(
                        'data-r0',
                        deepCopy(this.realtime_data_0),
                    );
                    break;
                case 0x01:
                    this.realtime_data_1 =
                        BafangCanControllerParser.package1(response);
                    this.emitter.emit(
                        'data-r1',
                        deepCopy(this.realtime_data_1),
                    );
                    break;
                case 0x03:
                    log.info('received can package:', response);
                    this.speed_parameter =
                        BafangCanControllerParser.parameter3(response);
                    this.emitter.emit(
                        'data-p3',
                        deepCopy(this.speed_parameter),
                    );
                    break;
                default:
                    break;
            }
        }
    }

    public loadData(): void {
        if (this.demo) {
            setTimeout(() => {
                this.emitter.emit('data-hv', this.hardware_version);
                this.emitter.emit('data-sv', this.software_version);
                this.emitter.emit('data-mn', this.model_number);
                this.emitter.emit('data-sn', this.serial_number);
                this.emitter.emit('data-m', this._manufacturer);
                this.emitter.emit('data-p1', deepCopy(this.parameter_1));
                this.emitter.emit('data-p2', deepCopy(this.parameter_2));
                this.emitter.emit('data-r0', deepCopy(this.realtime_data_0));
                this.emitter.emit('data-r1', deepCopy(this.realtime_data_1));
                this.emitter.emit('data-p3', deepCopy(this.speed_parameter));
                this.device_available = true;
                this.emitter.emit('read-finish', 8, 0);
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
            CanReadCommandsList.Manufacturer,
            CanReadCommandsList.MotorSpeedParameters,
            CanReadCommandsList.Parameter1,
            CanReadCommandsList.Parameter2,
        ];
        let readedSuccessfully = 0,
            readedNonSuccessfully = 0;

        commands.forEach((command) => {
            new Promise<boolean>((resolve, reject) => {
                if (!this.converterDevice || !this.requestManager) return;
                readParameter(
                    DeviceNetworkId.DRIVE_UNIT,
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

    public saveData(): void {
        if (this.demo) {
            setTimeout(() => this.emitter.emit('write-finish', 5, 0), 300);
            console.log('Demo mode: writing finished');
            return;
        }
        if (!this.converterDevice || !this.requestManager) return;
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        prepareStringWritePromise(
            //TODO check
            this._manufacturer,
            DeviceNetworkId.DRIVE_UNIT,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            writeLongParameter,
            this.converterDevice,
            this.requestManager,
        );
        prepareParameter1WritePromise(
            this.parameter_1,
            this.parameter_1_array,
            writePromises,
            writeLongParameter,
            this.converterDevice,
            this.requestManager,
        );
        prepareParameter2WritePromise(
            this.parameter_2,
            this.parameter_2_array,
            writePromises,
            writeLongParameter,
            this.converterDevice,
            this.requestManager,
        );
        prepareSpeedPackageWritePromise(
            this.speed_parameter,
            writePromises,
            writeShortParameter,
            this.converterDevice,
            this.requestManager,
        );
        for (let i = 0; i < writePromises.length; i++) {
            writePromises[i].then((success) => {
                if (success) wroteSuccessfully++;
                else wroteUnsuccessfully++;
                if (
                    wroteSuccessfully + wroteUnsuccessfully >=
                    writePromises.length
                ) {
                    this.emitter.emit(
                        'write-finish',
                        wroteSuccessfully,
                        wroteUnsuccessfully,
                    );
                }
            });
        }
    }

    public calibratePositionSensor(): Promise<boolean> {
        if (this.demo) {
            console.log('Demo mode: calibrated position sensor');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            if (!this.converterDevice || !this.requestManager) return;
            writeShortParameter(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.CalibratePositionSensor,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                this.converterDevice,
                this.requestManager,
                { resolve, reject },
            );
        });
    }

    public get available(): boolean {
        return this.device_available;
    }

    public get realtimeData0(): BafangCanControllerRealtime0 | null {
        return deepCopy(this.realtime_data_0);
    }

    public get realtimeData1(): BafangCanControllerRealtime1 | null {
        return deepCopy(this.realtime_data_1);
    }

    public get parameter1(): BafangCanControllerParameter1 | null {
        return deepCopy(this.parameter_1);
    }

    public set parameter1(data: BafangCanControllerParameter1 | null) {
        this.parameter_1 = deepCopy(data);
    }

    public get parameter1Array(): number[] | null {
        return deepCopy(this.parameter_1_array);
    }

    public get parameter2(): BafangCanControllerParameter2 | null {
        return deepCopy(this.parameter_2);
    }

    public set parameter2(data: BafangCanControllerParameter2 | null) {
        this.parameter_2 = deepCopy(data);
    }

    public get parameter2Array(): number[] | null {
        return deepCopy(this.parameter_2_array);
    }

    public get parameter3(): BafangCanControllerSpeedParameters | null {
        return deepCopy(this.speed_parameter);
    }

    public set parameter3(data: BafangCanControllerSpeedParameters | null) {
        this.speed_parameter = deepCopy(data);
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

    public get manufacturer(): string | null {
        return this._manufacturer;
    }

    public set manufacturer(data: string | null) {
        this._manufacturer = data;
    }
}
