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
import BesstDevice from '../../besst/besst';
import EventEmitter from 'events';
import { RequestManager } from '../../../utils/can/RequestManager';
import { BesstReadedCanFrame, DeviceNetworkId } from '../../besst/besst-types';

export default class BafangCanBattery {
    private besstDevice?: BesstDevice;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

    private device_available: boolean = false;

    private demo: boolean;

    private cells_voltage: number[] | null = null;

    private capacity_data: BafangCanBatteryCapacityData | null = null;

    private state_data: BafangCanBatteryStateData | null = null;

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
            this.cells_voltage = getBatteryCellsVoltageDemo();
            this.capacity_data = getBatteryCapacityDemoData();
            this.state_data = getBatteryStateDemoData();
            this.serial_number = getBatterySNDemo();
            this.software_version = getBatterySVDemo();
            this.hardware_version = getBatteryHVDemo();
            this.model_number = getBatteryMNDemo();
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
        // TODO
    }

    public loadData(): void {
        if (this.demo) {
            setTimeout(() => {
                this.emitter.emit('data-0', deepCopy(this.capacity_data));
                this.emitter.emit('data-1', deepCopy(this.state_data));
                this.emitter.emit('data-cells', deepCopy(this.cells_voltage));
                this.emitter.emit('data-hv', this.hardware_version);
                this.emitter.emit('data-sv', this.software_version);
                this.emitter.emit('data-mn', this.model_number);
                this.emitter.emit('data-sn', this.serial_number);
                this.device_available = true;
            }, 1500);
            console.log('Demo mode: blank data loaded');
            return;
        }
        // TODO
    }

    public get available(): boolean {
        return this.device_available;
    }

    public get cellsVoltage(): number[] | null {
        return deepCopy(this.cells_voltage);
    }

    public get capacityData(): BafangCanBatteryCapacityData | null {
        return deepCopy(this.capacity_data);
    }

    public get stateData(): BafangCanBatteryStateData | null {
        return deepCopy(this.state_data);
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
