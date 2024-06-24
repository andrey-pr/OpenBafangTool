import { deepCopy } from 'deep-copy-ts';
import {
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
} from '../../../types/BafangCanSystemTypes';
import { validateTime } from '../../../utils/utils';
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

export default class BafangCanDisplay {
    //TODO replace setters with inner parser
    private _data1: BafangCanDisplayData1 | null = null;

    private _data2: BafangCanDisplayData2 | null = null;

    private _realtimeData: BafangCanDisplayRealtimeData | null = null;

    private _errorCodes: number[] | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    private customer_number: string | null = null;

    private _manufacturer: string | null = null;

    private bootload_version: string | null = null;

    constructor(demo: boolean) {
        if (demo) {
            this._data1 = getDisplayDemoData1();
            this._data2 = getDisplayDemoData2();
            this._realtimeData = getDisplayRealtimeDemoData();
            this._errorCodes = getDisplayErrorCodesDemo();
            this.serial_number = getDisplaySNDemo();
            this.software_version = getDisplaySVDemo();
            this.hardware_version = getDisplayHVDemo();
            this.model_number = getDisplayMNDemo();
            this.customer_number = getDisplayCNDemo();
            this._manufacturer = getDisplayManufacturerDemo();
            this.bootload_version = getDisplayBVDemo();
        }
    }

    public loadData(): void {}

    public saveData(): void {}

    public setTime(
        hours: number,
        minutes: number,
        seconds: number,
    ): Promise<boolean> {
        if (!validateTime(hours, minutes, seconds)) {
            console.log('time is invalid');
            return new Promise<boolean>((resolve) => resolve(false));
        }
        return new Promise<boolean>((resolve) => resolve(false));
    } //TODO

    public cleanServiceMileage(): Promise<boolean> {
        return new Promise<boolean>((resolve) => resolve(false));
    } //TODO

    public get data1(): BafangCanDisplayData1 | null {
        return deepCopy(this._data1);
    }

    public set data1(data: BafangCanDisplayData1 | null) {
        this._data1 = deepCopy(data);
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

    public set data2(data: BafangCanDisplayData2 | null) {
        this._data2 = deepCopy(data);
    }

    public get realtimeData(): BafangCanDisplayRealtimeData | null {
        return deepCopy(this._realtimeData);
    }

    public set realtimeData(data: BafangCanDisplayRealtimeData | null) {
        this._realtimeData = deepCopy(data);
    }

    public get errorCodes(): number[] | null {
        return deepCopy(this._errorCodes);
    }

    public set errorCodes(codes: number[] | null) {
        this._errorCodes = deepCopy(codes);
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
