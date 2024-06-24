import { deepCopy } from 'deep-copy-ts';
import { BafangCanSensorRealtime } from '../../../types/BafangCanSystemTypes';
import {
    getSensorHVDemo,
    getSensorMNDemo,
    getSensorRealtimeDemoData,
    getSensorSNDemo,
    getSensorSVDemo,
} from '../../../utils/can/demo_object_provider';

export default class BafangCanSensor {
    //TODO replace setters with inner parser

    private _realtimeData: BafangCanSensorRealtime | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    constructor(demo: boolean) {
        if (demo) {
            this._realtimeData = getSensorRealtimeDemoData();
            this.serial_number = getSensorSNDemo();
            this.software_version = getSensorSVDemo();
            this.hardware_version = getSensorHVDemo();
            this.model_number = getSensorMNDemo();
        }
    }

    public loadData(): void {}

    public get realtimeData(): BafangCanSensorRealtime | null {
        return deepCopy(this._realtimeData);
    }

    public set realtimeData(data: BafangCanSensorRealtime | null) {
        this._realtimeData = deepCopy(data);
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
