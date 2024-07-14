/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import IConnection from './Connection';
import { CanConverterType, DeviceName } from '../../types/DeviceType';
import BesstDevice from '../besst/besst';
import BafangCanDisplay from './bafang-can-devices/BafangCanDisplay';
import BafangCanSensor from './bafang-can-devices/BafangCanSensor';
import BafangCanBattery from './bafang-can-devices/BafangCanBattery';
import BafangBesstTool from './bafang-can-devices/BafangBesstTool';
import { RequestManager } from '../../utils/can/RequestManager';
import BafangCanController from './bafang-can-devices/BafangCanController';
import { BafangCanBackup } from '../../logging/BafangCanBackup';
import CanableDevice from '../canable/canable';
import IGenericCanAdapter from '../can/generic';

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    private _converterType: CanConverterType;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: IGenericCanAdapter;

    public emitter: EventEmitter;

    private _controller: BafangCanController | null = null;

    private _display: BafangCanDisplay | null = null;

    private _sensor: BafangCanSensor | null = null;

    private _battery: BafangCanBattery | null = null;

    private _besst: BafangBesstTool | null = null;

    private requestManager?: RequestManager;

    private readingInProgress: boolean = false;

    constructor(devicePath: string, converterType: CanConverterType) {
        this.devicePath = devicePath;
        this._converterType = converterType;
        this.emitter = new EventEmitter();
        this.loadData = this.loadData.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
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
        if (this._converterType === CanConverterType.BESST) {
            this.device = new BesstDevice(this.devicePath);
            this._besst = new BafangBesstTool(
                false,
                this.device as BesstDevice,
            );
        } else {
            this.device = new CanableDevice(this.devicePath);
        }
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
        this.device?.emitter.on('disconnection', this.onDisconnect);

        return new Promise<boolean>(async (resolve) => {
            if (this._converterType === CanConverterType.BESST) {
                let besst = this.device as BesstDevice;
                besst.reset().then(() => {
                    besst.emitter.removeAllListeners();
                    this._controller?.connect();
                    this._display?.connect();
                    this._sensor?.connect();
                    this._battery?.connect();
                    this._besst?.connect();
                    this.device?.emitter.on('disconnection', this.onDisconnect);
                    besst.activateDriveUnit().then(() => {
                        resolve(true);
                    });
                });
            } else resolve(true);
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
                BafangCanBackup.saveBackup(
                    this._controller,
                    this._display,
                    this._sensor,
                    this._battery,
                );
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

    public get controller(): BafangCanController {
        if (this._controller) return this._controller;
        throw new ReferenceError();
    }

    public get display(): BafangCanDisplay {
        if (this._display) return this._display;
        throw new ReferenceError();
    }

    public get sensor(): BafangCanSensor {
        if (this._sensor) return this._sensor;
        throw new ReferenceError();
    }

    public get battery(): BafangCanBattery {
        if (this._battery) return this._battery;
        throw new ReferenceError();
    }

    public get besst(): BafangBesstTool | undefined {
        if (this._besst) return this._besst;
        return undefined;
    }

    public get converterType(): CanConverterType {
        return this._converterType;
    }
}
