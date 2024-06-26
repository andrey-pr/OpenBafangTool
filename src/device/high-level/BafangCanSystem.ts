/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { deepCopy } from 'deep-copy-ts';
import path from 'path';
import getAppDataPath from 'appdata-path';
import log from 'electron-log/renderer';
import IConnection from './Connection';
import { DeviceName } from '../../types/DeviceType';
import * as types from '../../types/BafangCanSystemTypes';
import * as ep from '../../utils/can/empty_object_provider';
import * as dp from '../../utils/can/demo_object_provider';
import * as parsers from '../../utils/can/parser';
import BesstDevice from '../besst/besst';
import {
    CanReadCommandsList,
    CanWriteCommandsList,
} from '../../constants/BafangCanConstants';
import { BesstReadedCanFrame, DeviceNetworkId } from '../besst/besst-types';
import BafangCanDisplay from './bafang-can-devices/BafangCanDisplay';
import BafangCanSensor from './bafang-can-devices/BafangCanSensor';
import BafangCanBattery from './bafang-can-devices/BafangCanBattery';
import BafangBesstTool from './bafang-can-devices/BafangBesstTool';
import { RequestManager } from '../../utils/can/RequestManager';
import { readParameter, rereadParameter, writeShortParameter } from '../../utils/can/utils';

type AvailabilityList = {
    controller: {
        device: boolean;
        realtime0: boolean;
        realtime1: boolean;
        parameter1: boolean;
        parameter2: boolean;
        speed_parameter: boolean;
    };
};

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: BesstDevice;

    public emitter: EventEmitter;

    private _display: BafangCanDisplay | null = null;

    private _sensor: BafangCanSensor | null = null;

    private _battery: BafangCanBattery | null = null;

    private _besst: BafangBesstTool | null = null;

    private _controllerRealtimeData0: types.BafangCanControllerRealtime0;

    private _controllerRealtimeData1: types.BafangCanControllerRealtime1;

    private _controllerParameter1: types.BafangCanControllerParameter1;

    private _controllerParameter2: types.BafangCanControllerParameter2;

    private controllerParameter1Array?: number[];

    private controllerParameter2Array?: number[];

    private _controllerSpeedParameters: types.BafangCanControllerSpeedParameters;

    private _controllerCodes: types.BafangCanControllerCodes;

    private requestManager?: RequestManager;

    private _availabilityList: AvailabilityList = {
        controller: {
            device: false,
            realtime0: false,
            realtime1: false,
            parameter1: false,
            parameter2: false,
            speed_parameter: false,
        },
    };

    private readingInProgress: boolean = false;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this._controllerRealtimeData0 = ep.getEmptyControllerRealtime0Data();
        this._controllerRealtimeData1 = ep.getEmptyControllerRealtime1Data();
        this._controllerParameter1 = ep.getEmptyControllerParameter1();
        this._controllerParameter2 = ep.getEmptyControllerParameter2();
        this._controllerSpeedParameters =
            ep.getEmptyControllerSpeedParameters();
        this._controllerCodes = ep.getEmptyControllerCodes();
        this.loadData = this.loadData.bind(this);
        this.saveControllerData = this.saveControllerData.bind(this);
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.saveBackup = this.saveBackup.bind(this);
    }

    onDisconnect() {
        this.device = undefined;
        this.emitter.emit('disconnection');
    }

    private processParsedCanResponse(response: BesstReadedCanFrame) {
        this.requestManager?.resolveRequest(response);
        if (response.canCommandCode === 0x60) {
            log.info('received can package:', response);
            if (response.data.length === 0) {
                rereadParameter(response, this.device);
                return;
            }
            if (response.sourceDeviceCode === DeviceNetworkId.DRIVE_UNIT) {
                if (response.canCommandSubCode === 0x11) {
                    this.controllerParameter1Array = response.data;
                    this._controllerParameter1 =
                        parsers.parseControllerParameter1(response);
                    this._availabilityList.controller.parameter1 = true;
                    this.emitter.emit(
                        'controller-data-parameter1',
                        deepCopy(this._controllerParameter1),
                    );
                } else if (response.canCommandSubCode === 0x12) {
                    this.controllerParameter2Array = response.data;
                    this._controllerParameter2 =
                        parsers.parseControllerParameter2(response);
                    this._availabilityList.controller.parameter2 = true;
                    this.emitter.emit(
                        'controller-data-parameter2',
                        deepCopy(this._controllerParameter2),
                    );
                } else {
                    parsers.processCodeAnswerFromController(
                        response,
                        this._controllerCodes,
                    );
                    this.emitter.emit(
                        'controller-codes-data',
                        deepCopy(this._controllerCodes),
                    );
                }
            }
        } else if (response.canCommandCode === 0x32) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    this._controllerRealtimeData0 =
                        parsers.parseControllerPackage0(response);
                    this._availabilityList.controller.realtime0 = true;
                    this.emitter.emit(
                        'controller-realtime-data-0',
                        deepCopy(this._controllerRealtimeData0),
                    );
                    break;
                case 0x01:
                    this._controllerRealtimeData1 =
                        parsers.parseControllerPackage1(response);
                    this._availabilityList.controller.realtime1 = true;
                    this.emitter.emit(
                        'controller-realtime-data-1',
                        deepCopy(this._controllerRealtimeData1),
                    );
                    break;
                case 0x03:
                    log.info('received can package:', response);
                    this._controllerSpeedParameters =
                        parsers.parseControllerPackage3(response);
                    this._availabilityList.controller.speed_parameter = true;
                    this.emitter.emit(
                        'controller-data-speed',
                        deepCopy(this._controllerSpeedParameters),
                    );
                    break;
                default:
                    break;
            }
        } else {
            console.log(response);
        }
    } // TODO

    public connect(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            this._display = new BafangCanDisplay(true);
            this._sensor = new BafangCanSensor(true);
            this._battery = new BafangCanBattery(true);
            this._besst = new BafangBesstTool(true);
            console.log('Demo mode: connected');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        this.device = new BesstDevice(this.devicePath);
        this.requestManager = new RequestManager(this.device);
        this._display = new BafangCanDisplay(
            false,
            this.device,
            this.requestManager,
        );
        this._sensor = new BafangCanSensor(false, this.device);
        this._battery = new BafangCanBattery(false, this.device);
        this._besst = new BafangBesstTool(false, this.device);
        this.device?.emitter.on('can', this.processParsedCanResponse);
        this.device?.emitter.on('disconnection', this.onDisconnect);

        return new Promise<boolean>(async (resolve) => {
            this.device?.reset().then(() => {
                this.device?.emitter.removeAllListeners();
                this._display?.connect();
                this._sensor?.connect();
                this._battery?.connect();
                this._besst?.connect();
                this.device?.emitter.on('can', this.processParsedCanResponse);
                this.device?.emitter.on('disconnection', this.onDisconnect);
                this.device?.activateDriveUnit().then(() => {
                    resolve(true);
                });
            });
        });
    }

    public disconnect(): void {
        if (this.devicePath === 'demo') {
            console.log('Demo mode: disconnected');
            return;
        }
        this.device?.disconnect();
    }

    public testConnection(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve) => {
            try {
                // this.device = new HID.HID(this.devicePath);
                resolve(true);
            } catch (error) {
                console.log(error);
                resolve(false);
            }
        });
    }

    public loadData(): void {
        if (this.devicePath === 'demo') {
            this._controllerRealtimeData0 = dp.getControllerRealtime0DemoData();
            this._controllerRealtimeData1 = dp.getControllerRealtime1DemoData();
            this._controllerParameter1 = dp.getControllerParameter1Demo();
            this._controllerParameter2 = dp.getControllerParameter2Demo();
            this.controllerParameter1Array =
                dp.getControllerParameter1ArrayDemo();
            this.controllerParameter2Array =
                dp.getControllerParameter2ArrayDemo();
            this._controllerSpeedParameters =
                dp.getControllerSpeedParametersDemo();
            this._controllerCodes = dp.getControllerCodesDemo();
            this._display?.loadData();
            this._sensor?.loadData();
            this._battery?.loadData();
            this._besst?.loadData();
            setTimeout(() => {
                this.emitter.emit(
                    'controller-codes-data',
                    deepCopy(this._controllerCodes),
                );
                this.emitter.emit(
                    'controller-data-speed',
                    deepCopy(this._controllerSpeedParameters),
                );
                this.emitter.emit(
                    'controller-data-parameter1',
                    deepCopy(this._controllerParameter1),
                );
                this.emitter.emit(
                    'controller-data-parameter2',
                    deepCopy(this._controllerParameter2),
                );
                this._availabilityList.controller.device = true;
                this._availabilityList.controller.realtime0 = true;
                this._availabilityList.controller.realtime1 = true;
                this._availabilityList.controller.speed_parameter = true;
                this._availabilityList.controller.parameter1 = true;
                this._availabilityList.controller.parameter2 = true;
                this.emitter.emit('reading-finish', 10, 0);
            }, 1500);
            console.log('Demo mode: blank data loaded');
            return;
        }
        if (this.readingInProgress) return;
        this.readingInProgress = true;
        this._display?.loadData();
        this._sensor?.loadData();
        this._battery?.loadData();
        this._besst?.loadData();
        const commands = [
            CanReadCommandsList.HardwareVersion,
            CanReadCommandsList.SoftwareVersion,
            CanReadCommandsList.ModelNumber,
            CanReadCommandsList.SerialNumber,
            CanReadCommandsList.CustomerNumber,
            CanReadCommandsList.Manufacturer,
            CanReadCommandsList.ErrorCode,
            CanReadCommandsList.BootloaderVersion,
            CanReadCommandsList.MotorSpeedParameters,
            CanReadCommandsList.Parameter1,
            CanReadCommandsList.Parameter2,
        ];
        let readedSuccessfully = 0,
            readedUnsuccessfully = 0;

        commands.forEach((command) => {
            new Promise<boolean>((resolve, reject) => {
                readParameter(
                    DeviceNetworkId.DRIVE_UNIT,
                    command,
                    this.device,
                    this.requestManager,
                    { resolve, reject },
                );
            }).then((success) => {
                if (success) readedSuccessfully++;
                else readedUnsuccessfully++;
                if (
                    readedSuccessfully + readedUnsuccessfully >=
                    commands.length
                ) {
                    this._availabilityList.controller.device =
                        readedSuccessfully > 0;
                    this.saveBackup();
                    this.emitter.emit(
                        'reading-finish',
                        readedSuccessfully,
                        readedUnsuccessfully,
                    );
                    this.readingInProgress = false;
                }
            });
        });
    }

    private saveBackup(): void {
        const fs = require('fs');
        let backup_text = JSON.stringify({
            controller_parameter1: this._controllerParameter1,
            controller_parameter2: this._controllerParameter2,
            controller_parameter1_array: this.controllerParameter1Array,
            controller_parameter2_array: this.controllerParameter2Array,
            controller_speed_parameters: this._controllerSpeedParameters,
            display_data1: this._display?.data1,
            display_data2: this._display?.data2,
            controller_codes: this._controllerCodes,
            display_serial_number: this._display?.serialNumber,
            display_hardware_version: this._display?.hardwareVersion,
            display_software_version: this._display?.softwareVersion,
            display_model_number: this._display?.modelNumber,
            display_customer_number: this._display?.customerNumber,
            display_manufacturer: this._display?.manufacturer,
            display_bootloader_version: this._display?.bootloaderVersion,
            sensor_serial_number: this._sensor?.serialNumber,
            sensor_hardware_version: this._sensor?.hardwareVersion,
            sensor_software_version: this._sensor?.softwareVersion,
            sensor_model_number: this._sensor?.modelNumber,
            battery_serial_number: this._battery?.serialNumber,
            battery_hardware_version: this._battery?.hardwareVersion,
            battery_software_version: this._battery?.softwareVersion,
            battery_model_number: this._battery?.modelNumber,
            controller_available: this._availabilityList.controller.device,
            controller_parameter1_available:
                this._availabilityList.controller.parameter1,
            controller_parameter2_available:
                this._availabilityList.controller.parameter2,
            controller_speed_parameter_available:
                this._availabilityList.controller.speed_parameter,
            display_available: this._display?.available,
            sensor_available: this._sensor?.available,
            battery_available: this._battery?.available,
        });
        let dir = path.join(getAppDataPath('open-bafang-tool'), `backups`);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, true);
            }
            fs.writeFileSync(
                path.join(dir, `backup-${new Date().toISOString()}.json`),
                backup_text,
                'utf-8',
            );
        } catch (e) {
            log.error('Failed to save the backup file! Backuping to logs:');
            log.error(backup_text);
        }
    }

    public saveControllerData(): void {
        if (this.devicePath === 'demo') {
            setTimeout(
                () => this.emitter.emit('controller-writing-finish', 10, 0),
                300,
            );
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        // serializers.prepareStringWritePromise(
        //     this._controllerCodes.controller_manufacturer,
        //     DeviceNetworkId.DRIVE_UNIT,
        //     CanWriteCommandsList.Manufacturer,
        //     writePromises,
        //     this.writeLongParameter,
        // );
        // serializers.prepareStringWritePromise(
        //     this._controllerCodes.controller_customer_number,
        //     DeviceNetworkId.DRIVE_UNIT,
        //     CanWriteCommandsList.CustomerNumber,
        //     writePromises,
        //     this.writeLongParameter,
        // );
        // serializers.prepareParameter1WritePromise(
        //     this._controllerParameter1,
        //     this.controllerParameter1Array,
        //     writePromises,
        //     this.writeLongParameter,
        // );
        // serializers.prepareParameter2WritePromise(
        //     this._controllerParameter2,
        //     this.controllerParameter2Array,
        //     writePromises,
        //     this.writeLongParameter,
        // );
        // serializers.prepareSpeedPackageWritePromise(
        //     this._controllerSpeedParameters,
        //     writePromises,
        //     this.writeShortParameter,
        // );
        for (let i = 0; i < writePromises.length; i++) {
            writePromises[i].then((success) => {
                if (success) wroteSuccessfully++;
                else wroteUnsuccessfully++;
                if (
                    wroteSuccessfully + wroteUnsuccessfully >=
                    writePromises.length
                ) {
                    this.emitter.emit(
                        'controller-writing-finish',
                        wroteSuccessfully,
                        wroteUnsuccessfully,
                    );
                }
            });
        }
    }

    public calibratePositionSensor(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            console.log('Calibrated position sensor');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            writeShortParameter(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.CalibratePositionSensor,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                this.device,
                this.requestManager,
                { resolve, reject },
            );
        });
    }

    public get isControllerAvailable(): boolean {
        return this._availabilityList.controller.device;
    }

    public get display(): BafangCanDisplay {
        if (this._display) return this._display;
        else throw new ReferenceError();
    }

    public get sensor(): BafangCanSensor {
        if (this._sensor) return this._sensor;
        else throw new ReferenceError();
    }

    public get battery(): BafangCanBattery {
        if (this._battery) return this._battery;
        else throw new ReferenceError();
    }

    public get besst(): BafangBesstTool {
        if (this._besst) return this._besst;
        else throw new ReferenceError();
    }

    public get isControllerRealtimeData0Ready(): boolean {
        return this._availabilityList.controller.realtime0;
    }

    public get controllerRealtimeData0(): types.BafangCanControllerRealtime0 {
        return deepCopy(this._controllerRealtimeData0);
    }

    public get isControllerRealtimeData1Ready(): boolean {
        return this._availabilityList.controller.realtime1;
    }

    public get controllerRealtimeData1(): types.BafangCanControllerRealtime1 {
        return deepCopy(this._controllerRealtimeData1);
    }

    public get isControllerParameter1Available(): boolean {
        return this._availabilityList.controller.parameter1;
    }

    public get controllerParameter1(): types.BafangCanControllerParameter1 {
        return deepCopy(this._controllerParameter1);
    }

    public set controllerParameter1(data: types.BafangCanControllerParameter1) {
        this._controllerParameter1 = deepCopy(data);
    }

    public get isControllerParameter2Available(): boolean {
        return this._availabilityList.controller.parameter2;
    }

    public get controllerParameter2(): types.BafangCanControllerParameter2 {
        return deepCopy(this._controllerParameter2);
    }

    public set controllerParameter2(data: types.BafangCanControllerParameter2) {
        this._controllerParameter2 = deepCopy(data);
    }

    public get isControllerSpeedParametersAvailable(): boolean {
        return this._availabilityList.controller.speed_parameter;
    }

    public get controllerSpeedParameters(): types.BafangCanControllerSpeedParameters {
        return deepCopy(this._controllerSpeedParameters);
    }

    public set controllerSpeedParameters(
        data: types.BafangCanControllerSpeedParameters,
    ) {
        this._controllerSpeedParameters = deepCopy(data);
    }

    public get controllerCodes(): types.BafangCanControllerCodes {
        return deepCopy(this._controllerCodes);
    }

    public set controllerCodes(data: types.BafangCanControllerCodes) {
        this._controllerCodes = deepCopy(data);
    }
}
