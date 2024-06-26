import { deepCopy } from 'deep-copy-ts';
import {
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
} from '../../../types/BafangCanSystemTypes';
import { charsToString, validateTime } from '../../../utils/utils';
import {
    getDisplayBVDemo,
    getDisplayCNDemo,
    getDisplayDemoData1,
    getDisplayDemoData2,
    getDisplayErrorCodesDemo,
    getDisplayHVDemo,
    getDisplayMNDemo,
    getDisplayManufacturerDemo,
    getDisplayRealtimeDemoData,
    getDisplaySNDemo,
    getDisplaySVDemo,
} from '../../../utils/can/demo_object_provider';
import BesstDevice from '../../besst/besst';
import { BesstReadedCanFrame, DeviceNetworkId } from '../../besst/besst-types';
import log from 'electron-log/renderer';
import {
    parseDisplayPackage0,
    parseDisplayPackage1,
    parseDisplayPackage2,
    parseErrorCodes,
} from '../../../utils/can/parser';
import { RequestManager } from '../../../utils/can/RequestManager';
import {
    CanReadCommandsList,
    CanWriteCommandsList,
} from '../../../constants/BafangCanConstants';
import EventEmitter from 'events';
import {
    readParameter,
    rereadParameter,
    writeLongParameter,
    writeShortParameter,
} from '../../../utils/can/utils';
import {
    prepareSingleMileageWritePromise,
    prepareStringWritePromise,
    prepareTotalMileageWritePromise,
} from '../../../utils/can/serializers';

export default class BafangCanDisplay {
    private besstDevice?: BesstDevice;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

    private readingInProgress: boolean = false;

    private device_available: boolean = false;

    private demo: boolean;

    private _data1: BafangCanDisplayData1 | null = null;

    private _data2: BafangCanDisplayData2 | null = null;

    private realtime_data: BafangCanDisplayRealtimeData | null = null;

    private _errorCodes: number[] | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    private customer_number: string | null = null;

    private _manufacturer: string | null = null;

    private bootload_version: string | null = null;

    constructor(
        demo: boolean,
        besstDevice?: BesstDevice,
        requestManager?: RequestManager,
    ) {
        if (demo) {
            this._data1 = getDisplayDemoData1();
            this._data2 = getDisplayDemoData2();
            this.realtime_data = getDisplayRealtimeDemoData();
            this._errorCodes = getDisplayErrorCodesDemo();
            this.serial_number = getDisplaySNDemo();
            this.software_version = getDisplaySVDemo();
            this.hardware_version = getDisplayHVDemo();
            this.model_number = getDisplayMNDemo();
            this.customer_number = getDisplayCNDemo();
            this._manufacturer = getDisplayManufacturerDemo();
            this.bootload_version = getDisplayBVDemo();
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
        if (response.sourceDeviceCode !== DeviceNetworkId.DISPLAY) return;
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
                    console.log(this.hardware_version);
                    break;
                case 0x01:
                    this.software_version = charsToString(response.data);
                    this.emitter.emit('data-sv', this.software_version);
                    console.log(this.software_version);
                    break;
                case 0x02:
                    this.model_number = charsToString(response.data);
                    this.emitter.emit('data-mn', this.model_number);
                    console.log(this.model_number);
                    break;
                case 0x03:
                    this.serial_number = charsToString(response.data);
                    this.emitter.emit('data-sn', this.serial_number);
                    console.log(this.serial_number);
                    break;
                case 0x04:
                    this.customer_number = charsToString(response.data);
                    this.emitter.emit('data-cn', this.customer_number);
                    console.log(this.customer_number);
                    break;
                case 0x05:
                    this.manufacturer = charsToString(response.data);
                    this.emitter.emit('data-m', this.manufacturer);
                    console.log(this.manufacturer);
                    break;
                case 0x07:
                    this._errorCodes = parseErrorCodes(response.data);
                    this.emitter.emit('data-ec', deepCopy(this._errorCodes));
                    console.log(this._errorCodes);
                    break;
                case 0x08:
                    this.bootload_version = charsToString(response.data);
                    this.emitter.emit('data-bv', this.bootload_version);
                    console.log(this.bootload_version);
                    break;
                default:
                    break;
            }
        } else if (response.canCommandCode === 0x63) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    this.realtime_data = parseDisplayPackage0(response);
                    this.emitter.emit('data-0', deepCopy(this.realtime_data));
                    console.log(this.realtime_data);
                    break;
                case 0x01:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        rereadParameter(response, this.besstDevice);
                        break;
                    }
                    this._data1 = parseDisplayPackage1(response);
                    this.emitter.emit('data-1', deepCopy(this._data1));
                    console.log(this._data1);
                    break;
                case 0x02:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        rereadParameter(response, this.besstDevice);
                        break;
                    }
                    this._data2 = parseDisplayPackage2(response);
                    this.emitter.emit('data-2', deepCopy(this._data2));
                    console.log(this._data2);
                    break;
                default:
                    break;
            }
        }
    } // TODO

    public loadData(): void {
        if (this.demo) {
            setTimeout(() => {
                this.emitter.emit('data-0', deepCopy(this.realtimeData));
                this.emitter.emit('data-1', deepCopy(this._data1));
                this.emitter.emit('data-2', deepCopy(this._data2));
                this.emitter.emit('data-ec', deepCopy(this._errorCodes));
                this.emitter.emit('data-hv', this.hardware_version);
                this.emitter.emit('data-sv', this.software_version);
                this.emitter.emit('data-mn', this.model_number);
                this.emitter.emit('data-sn', this.serial_number);
                this.emitter.emit('data-cn', this.customer_number);
                this.emitter.emit('data-m', this.manufacturer);
                this.emitter.emit('data-bv', this.bootload_version);
                this.device_available = true;
                this.emitter.emit('read-finish', 10, 0);
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
            CanReadCommandsList.CustomerNumber,
            CanReadCommandsList.Manufacturer,
            CanReadCommandsList.ErrorCode,
            CanReadCommandsList.BootloaderVersion,
            CanReadCommandsList.DisplayDataBlock1,
            CanReadCommandsList.DisplayDataBlock2,
        ];
        const summ = 10;
        let readedSuccessfully = 0,
            readedUnsuccessfully = 0;

        commands.forEach((command) => {
            new Promise<boolean>((resolve, reject) => {
                readParameter(
                    DeviceNetworkId.DISPLAY,
                    command,
                    this.besstDevice,
                    this.requestManager,
                    {
                        resolve,
                        reject,
                    },
                );
            }).then((success) => {
                if (success) readedSuccessfully++;
                else readedUnsuccessfully++;
                if (readedSuccessfully + readedUnsuccessfully >= summ) {
                    this.emitter.emit(
                        'read-finish',
                        readedSuccessfully,
                        readedUnsuccessfully,
                    );
                    this.readingInProgress = false;
                }
            });
        });
    }

    public saveData(): void {
        if (this.demo) {
            setTimeout(() => this.emitter.emit('write-finish', 4, 0), 300);
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        prepareStringWritePromise(
            this.manufacturer,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            writeLongParameter,
            this.besstDevice,
            this.requestManager,
        );
        prepareStringWritePromise(
            this.customer_number,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            writeLongParameter,
            this.besstDevice,
            this.requestManager,
        );
        prepareTotalMileageWritePromise(
            this._data1?.total_mileage,
            writePromises,
            writeShortParameter,
            this.besstDevice,
            this.requestManager,
        );
        prepareSingleMileageWritePromise(
            this._data1?.single_mileage,
            writePromises,
            writeShortParameter,
            this.besstDevice,
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

    public setTime(
        hours: number,
        minutes: number,
        seconds: number,
    ): Promise<boolean> {
        if (!validateTime(hours, minutes, seconds)) {
            console.log('time is invalid');
            return new Promise<boolean>((resolve) => resolve(false));
        }
        if (this.demo) {
            console.log(`New display time is ${hours}:${minutes}:${seconds}`);
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.DisplayTime,
                [hours, minutes, seconds],
                this.besstDevice,
                this.requestManager,
                { resolve, reject },
            );
        });
    }

    public cleanServiceMileage(): Promise<boolean> {
        if (this.demo) {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.CleanServiceMileage,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                this.besstDevice,
                this.requestManager,
                { resolve, reject },
            );
        });
    }

    public get available(): boolean {
        return this.device_available;
    }

    public get data1(): BafangCanDisplayData1 | null {
        return deepCopy(this._data1);
    }

    public set totalMileage(data: number) {
        if (this._data1) {
            this._data1.total_mileage = deepCopy(data);
        }
    }

    public set singleMileage(data: number) {
        if (this._data1) {
            this._data1.single_mileage = deepCopy(data);
        }
    }

    public get data2(): BafangCanDisplayData2 | null {
        return deepCopy(this._data2);
    }

    public get realtimeData(): BafangCanDisplayRealtimeData | null {
        return deepCopy(this.realtime_data);
    }

    public get errorCodes(): number[] | null {
        return deepCopy(this._errorCodes);
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

    public get customerNumber(): string | null {
        return this.customer_number;
    }

    public get manufacturer(): string | null {
        return this._manufacturer;
    }

    public get bootloaderVersion(): string | null {
        return this.bootload_version;
    }

    public set customerNumber(data: string | null) {
        this.customer_number = data;
    }

    public set manufacturer(data: string | null) {
        this._manufacturer = data;
    }
}
