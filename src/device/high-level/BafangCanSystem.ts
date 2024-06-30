/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import path from 'path';
import getAppDataPath from 'appdata-path';
import log from 'electron-log/renderer';
import IConnection from './Connection';
import { DeviceName } from '../../types/DeviceType';
import BesstDevice from '../besst/besst';
import { CanReadCommandsList } from '../../constants/BafangCanConstants';
import { DeviceNetworkId } from '../besst/besst-types';
import BafangCanDisplay from './bafang-can-devices/BafangCanDisplay';
import BafangCanSensor from './bafang-can-devices/BafangCanSensor';
import BafangCanBattery from './bafang-can-devices/BafangCanBattery';
import BafangBesstTool from './bafang-can-devices/BafangBesstTool';
import { RequestManager } from '../../utils/can/RequestManager';
import { readParameter, writeShortParameter } from '../../utils/can/utils';
import BafangCanController from './bafang-can-devices/BafangCanController';

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: BesstDevice;

    public emitter: EventEmitter;

    private _controller: BafangCanController | null = null;

    private _display: BafangCanDisplay | null = null;

    private _sensor: BafangCanSensor | null = null;

    private _battery: BafangCanBattery | null = null;

    private _besst: BafangBesstTool | null = null;

    private requestManager?: RequestManager;

    private readingInProgress: boolean = false;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this.loadData = this.loadData.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.saveBackup = this.saveBackup.bind(this);
    }

    onDisconnect() {
        this.device = undefined;
        this.emitter.emit('disconnection');
    }

    public connect(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            this._controller = new BafangCanController(true);
            this._display = new BafangCanDisplay(true);
            this._sensor = new BafangCanSensor(true);
            this._battery = new BafangCanBattery(true);
            this._besst = new BafangBesstTool(true);
            console.log('Demo mode: connected');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        this.device = new BesstDevice(this.devicePath);
        this.requestManager = new RequestManager(this.device);
        this._controller = new BafangCanController(
            false,
            this.device,
            this.requestManager,
        );
        this._display = new BafangCanDisplay(
            false,
            this.device,
            this.requestManager,
        );
        this._sensor = new BafangCanSensor(
            false,
            this.device,
            this.requestManager,
        );
        this._battery = new BafangCanBattery(
            false,
            this.device,
            this.requestManager,
        );
        this._besst = new BafangBesstTool(false, this.device);
        this.device?.emitter.on('disconnection', this.onDisconnect);

        return new Promise<boolean>(async (resolve) => {
            this.device?.reset().then(() => {
                this.device?.emitter.removeAllListeners();
                this._controller?.connect();
                this._display?.connect();
                this._sensor?.connect();
                this._battery?.connect();
                this._besst?.connect();
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
        if (this.readingInProgress) return;
        this.readingInProgress = true;
        let readedSuccessfully = 0,
            readedUnsuccessfully = 0,
            readedDevices = 0;
        const onReadFinish = (successful: number, nonsucessful: number) => {
            readedSuccessfully += successful;
            readedUnsuccessfully + nonsucessful;
            readedDevices++;
            if (readedDevices >= 5) {
                this.saveBackup();
                this.emitter.emit(
                    'read-finish',
                    readedSuccessfully,
                    readedUnsuccessfully,
                );
                this.readingInProgress = false;
            }
        };
        this._controller?.emitter.once('read-finish', onReadFinish);
        this._display?.emitter.once('read-finish', onReadFinish);
        this._sensor?.emitter.once('read-finish', onReadFinish);
        this._battery?.emitter.once('read-finish', onReadFinish);
        this._besst?.emitter.once('read-finish', onReadFinish);
        this._controller?.loadData();
        this._display?.loadData();
        this._sensor?.loadData();
        this._battery?.loadData();
        this._besst?.loadData();
    }

    private saveBackup(): void {
        const fs = require('fs');
        let backup_text = JSON.stringify({
            controller: {
                available: this._controller?.available,
                parameter1: this._controller?.parameter1,
                parameter2: this._controller?.parameter2,
                speed_parameters: this._controller?.parameter3,
                parameter1_array: this._controller?.parameter1Array,
                parameter2_array: this._controller?.parameter2Array,
            },
            display: {
                available: this._display?.available,
                data1: this._display?.data1,
                data2: this._display?.data2,
                serial_number: this._display?.serialNumber,
                hardware_version: this._display?.hardwareVersion,
                software_version: this._display?.softwareVersion,
                model_number: this._display?.modelNumber,
                customer_number: this._display?.customerNumber,
                manufacturer: this._display?.manufacturer,
                bootloader_version: this._display?.bootloaderVersion,
            },
            sensor: {
                available: this._sensor?.available,
                serial_number: this._sensor?.serialNumber,
                hardware_version: this._sensor?.hardwareVersion,
                software_version: this._sensor?.softwareVersion,
                model_number: this._sensor?.modelNumber,
            },
            battery: {
                available: this._battery?.available,
                serial_number: this._battery?.serialNumber,
                hardware_version: this._battery?.hardwareVersion,
                software_version: this._battery?.softwareVersion,
                model_number: this._battery?.modelNumber,
            },
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

    public get controller(): BafangCanController {
        if (this._controller) return this._controller;
        else throw new ReferenceError();
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
}
