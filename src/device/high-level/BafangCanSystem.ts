/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { deepCopy } from 'deep-copy-ts';
import IConnection from './Connection';
import { DeviceName } from '../../types/DeviceType';
import * as types from '../../types/BafangCanSystemTypes';
import * as utils from '../../utils/BafangCanUtils';
import BesstDevice from '../besst/besst';
import {
    CanCommand,
    CanReadCommandsList,
    CanWriteCommandsList,
} from '../../constants/BafangCanConstants';
import {
    BesstReadedCanFrame,
    CanOperation,
    DeviceNetworkId,
} from '../besst/besst-types';

type SentRequest = {
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
};

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: BesstDevice;

    public emitter: EventEmitter;

    private simulationDataPublisherInterval: NodeJS.Timeout | undefined;

    private simulationRealtimeDataGeneratorInterval: NodeJS.Timeout | undefined;

    private _controllerRealtimeData: types.BafangCanControllerRealtime;

    private _sensorRealtimeData: types.BafangCanSensorRealtime;

    private _controllerParameters1: types.BafangCanControllerParameters1;

    private _controllerSpeedParameters: types.BafangCanControllerSpeedParameters;

    private _displayData: types.BafangCanDisplayData;

    private _displayState: types.BafangCanDisplayState;

    private _displayErrorCodes: number[];

    private _controllerCodes: types.BafangCanControllerCodes;

    private _displayCodes: types.BafangCanDisplayCodes;

    private _sensorCodes: types.BafangCanSensorCodes;

    private _besstCodes: types.BafangBesstCodes;

    private sentRequests: SentRequest[][][] = [];

    private _displayAvailable: boolean = false;

    private _controllerAvailable: boolean = false;

    private _sensorAvailable: boolean = false;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this._controllerRealtimeData = utils.getEmptyControllerRealtimeData();
        this._sensorRealtimeData = utils.getEmptySensorRealtimeData();
        this._controllerParameters1 = utils.getEmptyControllerParameters1();
        this._controllerSpeedParameters =
            utils.getEmptyControllerSpeedParameters();
        this._displayData = utils.getEmptyDisplayData();
        this._displayState = utils.getEmptyDisplayRealtimeData();
        this._displayErrorCodes = [];
        this._controllerCodes = utils.getEmptyControllerCodes();
        this._displayCodes = utils.getEmptyDisplayCodes();
        this._sensorCodes = utils.getEmptySensorCodes();
        this._besstCodes = utils.getEmptyBesstCodes();
        this.loadData = this.loadData.bind(this);
        this.saveControllerData = this.saveControllerData.bind(this);
        this.saveDisplayData = this.saveDisplayData.bind(this);
        this.saveSensorData = this.saveSensorData.bind(this);
        this.simulationDataPublisher = this.simulationDataPublisher.bind(this);
        this.simulationRealtimeDataGenerator =
            this.simulationRealtimeDataGenerator.bind(this);
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.readParameter = this.readParameter.bind(this);
        this.writeShortParameter = this.writeShortParameter.bind(this);
        this.writeLongParameter = this.writeLongParameter.bind(this);
        this.registerRequest = this.registerRequest.bind(this);
        this.resolveRequest = this.resolveRequest.bind(this);
    }

    private simulationDataPublisher(): void {
        this.emitter.emit(
            'broadcast-data-controller',
            deepCopy(this._controllerRealtimeData),
        );
        this.emitter.emit(
            'broadcast-data-display',
            deepCopy(this._displayState),
        );
        this.emitter.emit(
            'broadcast-data-sensor',
            deepCopy(this._sensorRealtimeData),
        );
    }

    private simulationRealtimeDataGenerator(): void {
        this._displayState = {
            display_assist_levels: 5,
            display_ride_mode: types.BafangCanRideMode.ECO,
            display_boost: false,
            display_current_assist_level:
                this._displayState.display_current_assist_level === 'walk'
                    ? 5
                    : 'walk',
            display_light: !this._displayState.display_light,
            display_button: !this._displayState.display_button,
        };
    }

    private registerRequest(
        source: number,
        target: number,
        can_operation: CanOperation,
        code: number,
        subcode: number,
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
        attempt = 0,
    ): void {
        if (resolve && reject) {
            if (this.sentRequests[target] === undefined)
                this.sentRequests[target] = [];
            if (this.sentRequests[target][code] === undefined)
                this.sentRequests[target][code] = [];
            this.sentRequests[target][code][subcode] = { resolve, reject };
            setTimeout(() => {
                if (this.sentRequests[target][code][subcode]) {
                    if (attempt >= 3) {
                        resolve(false);
                        return;
                    }
                    this.device
                        ?.sendCanFrame(
                            source,
                            target,
                            can_operation,
                            code,
                            subcode,
                        )
                        .then(() =>
                            this.registerRequest(
                                source,
                                target,
                                can_operation,
                                code,
                                subcode,
                                resolve,
                                reject,
                                ++attempt,
                            ),
                        );
                }
            }, 1000);
        }
    }

    private resolveRequest(
        response: BesstReadedCanFrame,
        success = true,
    ): void {
        if (
            this.sentRequests[response.sourceDeviceCode] &&
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ] &&
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode]
        ) {
            this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode].resolve(success);
            delete this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode];
        }
    }

    private processParsedCanResponse(response: BesstReadedCanFrame) {
        this.resolveRequest(response);
        if (response.canCommandCode === 0x60) {
            if (response.data.length === 0) {
                this.resolveRequest(response);
                this.rereadParameter(response);
                return;
            }
            if (response.sourceDeviceCode === DeviceNetworkId.DISPLAY) {
                if (response.canCommandSubCode === 0x07) {
                    utils.parseErrorCodes(response, this._displayErrorCodes);
                    this.emitter.emit(
                        'display-error-codes',
                        this._displayErrorCodes,
                    );
                } else {
                    utils.processCodeAnswerFromDisplay(
                        response,
                        this._displayCodes,
                    );
                    this.emitter.emit(
                        'display-codes-data',
                        deepCopy(this._displayCodes),
                    );
                }
            } else if (
                response.sourceDeviceCode === DeviceNetworkId.DRIVE_UNIT
            ) {
                utils.processCodeAnswerFromController(
                    response,
                    this._controllerCodes,
                );
                this.emitter.emit(
                    'controller-codes-data',
                    deepCopy(this._controllerCodes),
                );
            } else if (
                response.sourceDeviceCode === DeviceNetworkId.TORQUE_SENSOR
            ) {
                utils.processCodeAnswerFromSensor(response, this._sensorCodes);
                this.emitter.emit(
                    'sensor-codes-data',
                    deepCopy(this._sensorCodes),
                );
            }
        } else if (response.canCommandCode === 0x63) {
            //code is hmi only
            switch (response.canCommandSubCode) {
                case 0x00:
                    utils.parseDisplayPackage0(response, this._displayState);
                    this.emitter.emit(
                        'broadcast-data-display',
                        deepCopy(this._displayState),
                    );
                    break;
                case 0x01:
                    if (response.data.length === 0) {
                        this.resolveRequest(response);
                        this.rereadParameter(response);
                        break;
                    }
                    utils.parseDisplayPackage1(response, this._displayData);
                    this.emitter.emit(
                        'display-general-data',
                        deepCopy(this._displayData),
                    );
                    break;
                case 0x02:
                    if (response.data.length === 0) {
                        this.resolveRequest(response);
                        this.rereadParameter(response);
                        break;
                    }
                    utils.parseDisplayPackage2(response, this._displayData);
                    this.emitter.emit(
                        'display-general-data',
                        deepCopy(this._displayData),
                    );
                    break;
                default:
                    break;
            }
        } else if (
            response.canCommandCode === 0x31 &&
            response.canCommandSubCode === 0x00
        ) {
            utils.parseSensorPackage(response, this._sensorRealtimeData);
            this.emitter.emit(
                'broadcast-data-sensor',
                deepCopy(this._sensorRealtimeData),
            );
        } else if (response.canCommandCode === 0x32) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    utils.parseControllerPackage0(
                        response,
                        this._controllerRealtimeData,
                    );
                    this.emitter.emit(
                        'broadcast-data-controller',
                        deepCopy(this._controllerRealtimeData),
                    );
                    break;
                case 0x01:
                    utils.parseControllerPackage1(
                        response,
                        this._controllerRealtimeData,
                    );
                    this.emitter.emit(
                        'broadcast-data-controller',
                        deepCopy(this._controllerRealtimeData),
                    );
                    break;
                case 0x03:
                    utils.parseControllerPackage3(
                        response,
                        this._controllerSpeedParameters,
                    );
                    this.emitter.emit(
                        'controller-speed-data',
                        deepCopy(this._controllerSpeedParameters),
                    );
                    break;
                default:
                    break;
            }
        } else {
            console.log(response);
        }
    } //TODO

    public connect(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            this.simulationDataPublisherInterval = setInterval(
                this.simulationDataPublisher,
                1500,
            );
            this.simulationRealtimeDataGeneratorInterval = setInterval(
                this.simulationRealtimeDataGenerator,
                5000,
            );
            console.log('Simulator connected');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        this.device = new BesstDevice(this.devicePath);
        this.device?.emitter.on('can', this.processParsedCanResponse);

        return new Promise<boolean>(async (resolve) => {
            this.device?.reset().then(() => {
                this.device?.emitter.on('can', this.processParsedCanResponse);
                this.device?.activateDriveUnit().then(() => {
                    resolve(true);
                });
            });
        });
    }

    public disconnect(): void {
        if (this.devicePath === 'simulator') {
            console.log('Simulator disconnected');
            clearInterval(this.simulationDataPublisherInterval);
            clearInterval(this.simulationRealtimeDataGeneratorInterval);
            return;
        }
        this.device?.disconnect();
    }

    public testConnection(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
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
        if (this.devicePath === 'simulator') {
            this._controllerRealtimeData =
                utils.getControllerRealtimeDemoData();
            this._sensorRealtimeData = utils.getSensorRealtimeDemoData();
            this._controllerParameters1 = utils.getControllerParameters1Demo();
            this._controllerSpeedParameters =
                utils.getControllerSpeedParametersDemo();
            this._displayData = utils.getDisplayDemoData();
            this._displayState = utils.getDisplayRealtimeDemoData();
            this._displayErrorCodes = [14, 21, -1];
            this._controllerCodes = utils.getControllerCodesEmpty();
            this._displayCodes = utils.getDisplayCodesDemo();
            this._sensorCodes = utils.getSensorCodesDemo();
            this._besstCodes = utils.getBesstCodesDemo();
            setTimeout(() => {
                this.emitter.emit(
                    'controller-codes-data',
                    deepCopy(this._controllerCodes),
                );
                this.emitter.emit(
                    'controller-speed-data',
                    deepCopy(this._controllerSpeedParameters),
                );
                this.emitter.emit(
                    'display-general-data',
                    deepCopy(this._displayData),
                );
                this.emitter.emit(
                    'broadcast-data-display',
                    deepCopy(this._displayState),
                );
                this.emitter.emit(
                    'display-codes-data',
                    deepCopy(this._displayCodes),
                );
                this.emitter.emit(
                    'sensor-codes-data',
                    deepCopy(this._sensorCodes),
                );
                this._displayAvailable = true;
                this._controllerAvailable = true;
                this._sensorAvailable = true;
                this.emitter.emit('reading-finish', 10, 0);
            }, 1500);
            console.log('Simulator: blank data loaded');
            return;
        }
        this.device?.getSerialNumber().then((serial_number: string) => {
            if (serial_number === undefined) return;
            this._besstCodes.besst_serial_number = serial_number;
            this.emitter.emit('besst-data', deepCopy(this._besstCodes));
        });
        this.device?.getSoftwareVersion().then((software_version: string) => {
            if (software_version === undefined) return;
            this._besstCodes.besst_software_version = software_version;
            this.emitter.emit('besst-data', deepCopy(this._besstCodes));
        });
        this.device?.getHardwareVersion().then((hardware_version: string) => {
            if (hardware_version === undefined) return;
            this._besstCodes.besst_hardware_version = hardware_version;
            this.emitter.emit('besst-data', deepCopy(this._besstCodes));
        });
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
            CanReadCommandsList.MotorSpeedParameters,
        ];
        const summ = 4 * 3 + 2 * 2 + 5;
        let readedSuccessfully = 0,
            readedUnsuccessfully = 0,
            readedDisplay = 0,
            readedController = 0,
            readedSensor = 0;

        commands.forEach((command) => {
            command.applicableDevices.forEach((device) => {
                new Promise<boolean>((resolve, reject) => {
                    this.readParameter(device, command, resolve, reject);
                }).then((success) => {
                    if (success) readedSuccessfully++;
                    else readedUnsuccessfully++;
                    if (success && device === DeviceNetworkId.DISPLAY)
                        readedDisplay++;
                    else if (success && device === DeviceNetworkId.DRIVE_UNIT)
                        readedController++;
                    else if (
                        success &&
                        device === DeviceNetworkId.TORQUE_SENSOR
                    )
                        readedSensor++;
                    if (readedSuccessfully + readedUnsuccessfully >= summ) {
                        this._displayAvailable = readedDisplay > 0;
                        this._controllerAvailable = readedController > 0;
                        this._sensorAvailable = readedSensor > 0;
                        this.emitter.emit(
                            'reading-finish',
                            readedSuccessfully,
                            readedUnsuccessfully,
                        );
                    }
                });
            });
        });
    }

    private rereadParameter(dto: BesstReadedCanFrame): void {
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            dto.sourceDeviceCode,
            CanOperation.READ_CMD,
            dto.canCommandCode,
            dto.canCommandSubCode,
        );
    }

    private readParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ): void {
        this.device
            ?.sendCanFrame(
                DeviceNetworkId.BESST,
                target,
                CanOperation.READ_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
            )
            .then(() =>
                this.registerRequest(
                    DeviceNetworkId.BESST,
                    target,
                    CanOperation.READ_CMD,
                    can_command.canCommandCode,
                    can_command.canCommandSubCode,
                    resolve,
                    reject,
                ),
            );
    }

    private writeShortParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ): void {
        this.device
            ?.sendCanFrame(
                DeviceNetworkId.BESST,
                target,
                CanOperation.WRITE_CMD,
                can_command.canCommandCode,
                can_command.canCommandSubCode,
                value,
            )
            .then(() =>
                this.registerRequest(
                    DeviceNetworkId.BESST,
                    target,
                    CanOperation.WRITE_CMD,
                    can_command.canCommandCode,
                    can_command.canCommandSubCode,
                    resolve,
                    reject,
                ),
            );
    }

    private writeLongParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        resolve?: (...args: any[]) => void,
        reject?: (...args: any[]) => void,
    ): void {
        let arrayClone = [...value];
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.WRITE_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
            [arrayClone.length],
        );
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.MULTIFRAME_START,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
            arrayClone.slice(0, 8),
        );
        arrayClone = arrayClone.slice(8);
        let packages = 0;
        do {
            this.device?.sendCanFrame(
                DeviceNetworkId.BESST,
                target,
                CanOperation.MULTIFRAME,
                0,
                packages++,
                arrayClone.slice(0, 8),
            );
            arrayClone = arrayClone.slice(8);
        } while (arrayClone.length > 8);
        this.device
            ?.sendCanFrame(
                DeviceNetworkId.BESST,
                target,
                CanOperation.MULTIFRAME_END,
                0,
                packages,
                arrayClone.slice(0, 8),
            )
            .then(() =>
                this.registerRequest(
                    DeviceNetworkId.BESST,
                    target,
                    CanOperation.WRITE_CMD,
                    can_command.canCommandCode,
                    can_command.canCommandSubCode,
                    resolve,
                    reject,
                ),
            );
    }

    public saveControllerData(): void {
        if (this.devicePath === 'simulator') {
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        utils.prepareStringWritePromise(
            this._controllerCodes.controller_manufacturer,
            DeviceNetworkId.DRIVE_UNIT,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            this.writeLongParameter,
        );
        utils.prepareStringWritePromise(
            this._controllerCodes.controller_customer_number,
            DeviceNetworkId.DRIVE_UNIT,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            this.writeLongParameter,
        );
        utils.prepareSpeedPackageWritePromise(
            this._controllerSpeedParameters,
            writePromises,
            this.writeLongParameter,
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
                        'controller-writing-finish',
                        wroteSuccessfully,
                        wroteUnsuccessfully,
                    );
                }
            });
        }
    }

    public saveDisplayData(): void {
        if (this.devicePath === 'simulator') {
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        utils.prepareStringWritePromise(
            this._displayCodes.display_manufacturer,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            this.writeLongParameter,
        );
        utils.prepareStringWritePromise(
            this._displayCodes.display_customer_number,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            this.writeLongParameter,
        );
        utils.prepareMileageWritePromise(
            this._displayData.display_total_mileage,
            CanWriteCommandsList.DisplayTotalMileage,
            writePromises,
            this.writeLongParameter,
        );
        utils.prepareMileageWritePromise(
            this._displayData.display_single_mileage,
            CanWriteCommandsList.DisplaySingleMileage,
            writePromises,
            this.writeLongParameter,
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
                        'display-writing-finish',
                        wroteSuccessfully,
                        wroteUnsuccessfully,
                    );
                }
            });
        }
    }

    public saveSensorData(): void {
        if (this.devicePath === 'simulator') {
            return;
        }
        let writePromises: Promise<boolean>[] = [];
        utils.prepareStringWritePromise(
            this._sensorCodes.sensor_customer_number,
            DeviceNetworkId.TORQUE_SENSOR,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            this.writeLongParameter,
        );
        if (writePromises.length) {
            writePromises[0].then((success) => {
                this.emitter.emit(
                    'sensor-writing-finish',
                    success ? 1 : 0,
                    success ? 0 : 1,
                );
            });
        }
    }

    public setDisplayTime(
        hours: number,
        minutes: number,
        seconds: number,
    ): Promise<boolean> {
        if (!utils.validateTime(hours, minutes, seconds)) {
            return new Promise<boolean>((resolve) => resolve(false));
        }
        if (this.devicePath === 'simulator') {
            console.log(`New display time is ${hours}:${minutes}:${seconds}`);
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.DisplayTime,
                [hours, minutes, seconds],
                resolve,
                reject,
            );
        });
    }

    public cleanDisplayServiceMileage(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.CleanServiceMileage,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                resolve,
                reject,
            );
        });
    }

    public get controllerCodes(): types.BafangCanControllerCodes {
        return deepCopy(this._controllerCodes);
    }

    public set controllerCodes(data: types.BafangCanControllerCodes) {
        this._controllerCodes = deepCopy(data);
    }

    public get controllerRealtimeData(): types.BafangCanControllerRealtime {
        return deepCopy(this._controllerRealtimeData);
    }

    public get controllerParameters1(): types.BafangCanControllerParameters1 {
        return deepCopy(this._controllerParameters1);
    }

    public set controllerParameters1(
        data: types.BafangCanControllerParameters1,
    ) {
        this._controllerParameters1 = deepCopy(data);
    }

    public get controllerSpeedParameters(): types.BafangCanControllerSpeedParameters {
        return deepCopy(this._controllerSpeedParameters);
    }

    public set controllerSpeedParameters(
        data: types.BafangCanControllerSpeedParameters,
    ) {
        this._controllerSpeedParameters = deepCopy(data);
    }

    public get displayData(): types.BafangCanDisplayData {
        return deepCopy(this._displayData);
    }

    public set displayData(data: types.BafangCanDisplayData) {
        this._displayData = deepCopy(data);
    }

    public get displayRealtimeData(): types.BafangCanDisplayState {
        return deepCopy(this._displayState);
    }

    public get displayErrorCodes(): number[] {
        return deepCopy(this._displayErrorCodes);
    }

    public get displayCodes(): types.BafangCanDisplayCodes {
        return deepCopy(this._displayCodes);
    }

    public set displayCodes(data: types.BafangCanDisplayCodes) {
        this._displayCodes = deepCopy(data);
    }

    public get sensorRealtimeData(): types.BafangCanSensorRealtime {
        return deepCopy(this._sensorRealtimeData);
    }

    public get sensorCodes(): types.BafangCanSensorCodes {
        return deepCopy(this._sensorCodes);
    }

    public set sensorCodes(data: types.BafangCanSensorCodes) {
        this._sensorCodes = deepCopy(data);
    }

    public get besstCodes(): types.BafangBesstCodes {
        return deepCopy(this._besstCodes);
    }

    public set besstCodes(data: types.BafangBesstCodes) {
        this._besstCodes = deepCopy(data);
    }

    public get isDisplayAvailable(): boolean {
        return this._displayAvailable;
    }

    public get isControllerAvailable(): boolean {
        return this._controllerAvailable;
    }

    public get isSensorAvailable(): boolean {
        return this._sensorAvailable;
    }
}
