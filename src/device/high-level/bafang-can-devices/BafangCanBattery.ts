import { deepCopy } from 'deep-copy-ts';
import {
    BafangCanBatteryCapacityData,
    BafangCanBatteryStateData,
} from '../../../types/BafangCanSystemTypes';
import {
    getBatteryCapacityDemoData,
    getBatteryCellsVoltageDemo,
    getBatteryHVDemo,
    getBatteryMNDemo,
    getBatterySNDemo,
    getBatterySVDemo,
    getBatteryStateDemoData,
} from '../../../utils/can/demo_object_provider';

export default class BafangCanBattery {
    //TODO replace setters with inner parser

    private _cellsVoltage: number[] | null = null;

    private _capacityData: BafangCanBatteryCapacityData | null = null;

    private _stateData: BafangCanBatteryStateData | null = null;

    private hardware_version: string | null = null;

    private software_version: string | null = null;

    private model_number: string | null = null;

    private serial_number: string | null = null;

    constructor(demo: boolean) {
        if (demo) {
            this._cellsVoltage = getBatteryCellsVoltageDemo();
            this._capacityData = getBatteryCapacityDemoData();
            this._stateData = getBatteryStateDemoData();
            this.serial_number = getBatterySNDemo();
            this.software_version = getBatterySVDemo();
            this.hardware_version = getBatteryHVDemo();
            this.model_number = getBatteryMNDemo();
        }
    }

    public loadData(): void {}

    public get cellsVoltage(): number[] | null {
        return deepCopy(this._cellsVoltage);
    }

    public set cellsVoltage(data: number[] | null) {
        this._cellsVoltage = deepCopy(data);
    }

    public get capacityData(): BafangCanBatteryCapacityData | null {
        return deepCopy(this._capacityData);
    }

    public set capacityData(data: BafangCanBatteryCapacityData | null) {
        this._capacityData = deepCopy(data);
    }

    public get stateData(): BafangCanBatteryStateData | null {
        return deepCopy(this._stateData);
    }

    public set stateData(data: BafangCanBatteryStateData | null) {
        this._stateData = deepCopy(data);
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
