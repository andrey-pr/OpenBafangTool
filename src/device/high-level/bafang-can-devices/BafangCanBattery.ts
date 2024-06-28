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
import log from 'electron-log/renderer';
import { readParameter, rereadParameter } from '../../../utils/can/utils';
import { charsToString } from '../../../utils/utils';
import { CanReadCommandsList } from '../../../constants/BafangCanConstants';
import { BafangCanBatteryParser } from '../../../parser/bafang/can/parser/Battery';

export default class BafangCanBattery {
    private besstDevice?: BesstDevice;

    private requestManager?: RequestManager;

    public emitter: EventEmitter;

    private readingInProgress: boolean = false;

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
        if (response.sourceDeviceCode !== DeviceNetworkId.BATTERY) return;
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
        } else if (response.canCommandCode === 0x34) {
            if (response.canCommandSubCode === 0x00) {
                this.capacity_data = BafangCanBatteryParser.capacity(response);
                this.emitter.emit('data-0', deepCopy(this.capacity_data));
            }
            if (response.canCommandSubCode === 0x01) {
                this.state_data = BafangCanBatteryParser.state(response);
                this.emitter.emit('data-1', deepCopy(this.state_data));
            }
        } else if (response.canCommandCode === 0x64) {
            if (!this.cells_voltage) this.cells_voltage = [];
            BafangCanBatteryParser.cells(response, this.cells_voltage);
            this.emitter.emit('data-cells', deepCopy(this.state_data));
        }
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
                this.emitter.emit('read-finish', 7, 0);
            }, 1500);
            console.log('Demo mode: blank data loaded');
            return;
        }
        this.emitter.emit('read-finish', 0, 0);
        if (this.readingInProgress) return;
        this.readingInProgress = true;
        const commands = [
            CanReadCommandsList.HardwareVersion,
            CanReadCommandsList.SoftwareVersion,
            CanReadCommandsList.ModelNumber,
            CanReadCommandsList.SerialNumber,
            CanReadCommandsList.CellsVoltage0,
            CanReadCommandsList.CellsVoltage1,
            CanReadCommandsList.CellsVoltage2,
            CanReadCommandsList.CellsVoltage3,
        ];
        let readedSuccessfully = 0,
            readedNonSuccessfully = 0;

        commands.forEach((command) => {
            new Promise<boolean>((resolve, reject) => {
                readParameter(
                    DeviceNetworkId.BATTERY,
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
