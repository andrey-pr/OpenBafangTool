/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { deepCopy } from 'deep-copy-ts';
import IConnection from './Connection';
import { DeviceName } from '../../types/DeviceType';
import * as types from '../../types/BafangCanSystemTypes';
import * as utils from '../../utils/utils';
import * as ep from '../../utils/can/empty_object_provider';
import * as dp from '../../utils/can/demo_object_provider';
import * as parsers from '../../utils/can/parser';
import * as serializers from '../../utils/can/serializers';
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
import log from 'electron-log/renderer';

type SentRequest = {
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
    can_operation: CanOperation;
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

    private _controllerParameter1: types.BafangCanControllerParameter1;

    private _controllerParameter2: types.BafangCanControllerParameter2;

    private controllerParameter1Array?: number[];

    private controllerParameter2Array?: number[];

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

    private readingInProgress: boolean = false;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this._controllerRealtimeData = ep.getEmptyControllerRealtimeData();
        this._sensorRealtimeData = ep.getEmptySensorRealtimeData();
        this._controllerParameter1 = ep.getEmptyControllerParameter1();
        this._controllerParameter2 = ep.getEmptyControllerParameter2();
        this._controllerSpeedParameters =
            ep.getEmptyControllerSpeedParameters();
        this._displayData = ep.getEmptyDisplayData();
        this._displayState = ep.getEmptyDisplayRealtimeData();
        this._displayErrorCodes = [];
        this._controllerCodes = ep.getEmptyControllerCodes();
        this._displayCodes = ep.getEmptyDisplayCodes();
        this._sensorCodes = ep.getEmptySensorCodes();
        this._besstCodes = ep.getEmptyBesstCodes();
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
        this.disconnect = this.disconnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
    }

    onDisconnect() {
        this.device = undefined;
        this.emitter.emit('disconnection');
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
            this.sentRequests[target][code][subcode] = {
                resolve,
                reject,
                can_operation,
            };
            setTimeout(() => {
                if (this.sentRequests[target][code][subcode]) {
                    if (
                        this.sentRequests[target][code][subcode]
                            .can_operation !== CanOperation.READ_CMD ||
                        attempt >= 3
                    ) {
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
            }, 5000);
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
            log.info('received can package:', response);
            if (response.data.length === 0) {
                this.resolveRequest(response);
                this.rereadParameter(response);
                return;
            }
            if (response.sourceDeviceCode === DeviceNetworkId.DISPLAY) {
                if (response.canCommandSubCode === 0x07) {
                    parsers.parseErrorCodes(response, this._displayErrorCodes);
                    this.emitter.emit(
                        'display-error-codes',
                        this._displayErrorCodes,
                    );
                } else {
                    parsers.processCodeAnswerFromDisplay(
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
                if (response.canCommandSubCode == 0x11) {
                    this.controllerParameter1Array = response.data;
                    parsers.parseControllerParameter1(
                        response,
                        this._controllerParameter1,
                    );
                    this.emitter.emit(
                        'controller-parameter1',
                        deepCopy(this._controllerParameter1),
                    );
                } else if (response.canCommandSubCode == 0x12) {
                    this.controllerParameter2Array = response.data;
                    parsers.parseControllerParameter2(
                        response,
                        this._controllerParameter2,
                    );
                    this.emitter.emit(
                        'controller-parameter2',
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
            } else if (
                response.sourceDeviceCode === DeviceNetworkId.TORQUE_SENSOR
            ) {
                parsers.processCodeAnswerFromSensor(
                    response,
                    this._sensorCodes,
                );
                this.emitter.emit(
                    'sensor-codes-data',
                    deepCopy(this._sensorCodes),
                );
            }
        } else if (response.canCommandCode === 0x63) {
            //code is hmi only
            switch (response.canCommandSubCode) {
                case 0x00:
                    parsers.parseDisplayPackage0(response, this._displayState);
                    this.emitter.emit(
                        'broadcast-data-display',
                        deepCopy(this._displayState),
                    );
                    break;
                case 0x01:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        this.resolveRequest(response);
                        this.rereadParameter(response);
                        break;
                    }
                    parsers.parseDisplayPackage1(response, this._displayData);
                    this.emitter.emit(
                        'display-general-data',
                        deepCopy(this._displayData),
                    );
                    break;
                case 0x02:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        this.resolveRequest(response);
                        this.rereadParameter(response);
                        break;
                    }
                    parsers.parseDisplayPackage2(response, this._displayData);
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
            parsers.parseSensorPackage(response, this._sensorRealtimeData);
            this.emitter.emit(
                'broadcast-data-sensor',
                deepCopy(this._sensorRealtimeData),
            );
        } else if (response.canCommandCode === 0x32) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    parsers.parseControllerPackage0(
                        response,
                        this._controllerRealtimeData,
                    );
                    this.emitter.emit(
                        'broadcast-data-controller',
                        deepCopy(this._controllerRealtimeData),
                    );
                    break;
                case 0x01:
                    parsers.parseControllerPackage1(
                        response,
                        this._controllerRealtimeData,
                    );
                    this.emitter.emit(
                        'broadcast-data-controller',
                        deepCopy(this._controllerRealtimeData),
                    );
                    break;
                case 0x03:
                    log.info('received can package:', response);
                    parsers.parseControllerPackage3(
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
        this.device?.emitter.on('disconnection', this.onDisconnect);

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
            this._controllerRealtimeData = dp.getControllerRealtimeDemoData();
            this._sensorRealtimeData = dp.getSensorRealtimeDemoData();
            this._controllerParameter1 = dp.getControllerParameter1Demo();
            this._controllerParameter2 = dp.getControllerParameter2Demo();
            this.controllerParameter1Array = [
                36, 18, 47, 128, 12, 172, 13, 16, 39, 3, 25, 15, 45, 0, 0, 24,
                2, 12, 1, 4, 1, 1, 66, 14, 204, 16, 0, 0, 0, 0, 0, 0, 0, 0, 12,
                36, 0, 25, 2, 5, 25, 30, 37, 45, 52, 60, 70, 80, 100, 100, 100,
                100, 100, 100, 100, 100, 100, 100, 0, 0, 94, 1, 255, 183,
            ];
            this.controllerParameter2Array = [
                8, 6, 5, 4, 3, 2, 50, 45, 40, 32, 25, 18, 6, 5, 4, 3, 2, 2, 100,
                100, 100, 100, 100, 100, 15, 15, 15, 15, 15, 15, 5, 5, 4, 4, 3,
                3, 1, 1, 1, 1, 1, 1, 16, 16, 14, 12, 10, 10, 90, 100, 90, 90,
                85, 75, 255, 255, 255, 255, 255, 255, 255, 255, 255, 43,
            ];
            this._controllerSpeedParameters =
                dp.getControllerSpeedParametersDemo();
            this._displayData = dp.getDisplayDemoData();
            this._displayState = dp.getDisplayRealtimeDemoData();
            this._displayErrorCodes = [14, 21, -1];
            this._controllerCodes = dp.getControllerCodesDemo();
            this._displayCodes = dp.getDisplayCodesDemo();
            this._sensorCodes = dp.getSensorCodesDemo();
            this._besstCodes = dp.getBesstCodesDemo();
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
                    'controller-parameter1',
                    deepCopy(this._controllerParameter1),
                );
                this.emitter.emit(
                    'controller-parameter2',
                    deepCopy(this._controllerParameter2),
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
        if (this.readingInProgress) return;
        this.readingInProgress = true;
        this.device
            ?.getSerialNumber()
            .then((serial_number: string) => {
                if (serial_number === undefined) return;
                this._besstCodes.besst_serial_number = serial_number;
                this.emitter.emit('besst-data', deepCopy(this._besstCodes));
            })
            .catch(() => {});
        this.device
            ?.getSoftwareVersion()
            .then((software_version: string) => {
                if (software_version === undefined) return;
                this._besstCodes.besst_software_version = software_version;
                this.emitter.emit('besst-data', deepCopy(this._besstCodes));
            })
            .catch(() => {});
        this.device
            ?.getHardwareVersion()
            .then((hardware_version: string) => {
                if (hardware_version === undefined) return;
                this._besstCodes.besst_hardware_version = hardware_version;
                this.emitter.emit('besst-data', deepCopy(this._besstCodes));
            })
            .catch(() => {});
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
            CanReadCommandsList.Parameter1,
            CanReadCommandsList.Parameter2,
        ];
        const summ = 4 * 3 + 2 * 2 + 7;
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
                        this.readingInProgress = false;
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
            setTimeout(
                () => this.emitter.emit('controller-writing-finish', 10, 0),
                300,
            );
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        serializers.prepareStringWritePromise(
            this._controllerCodes.controller_manufacturer,
            DeviceNetworkId.DRIVE_UNIT,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareStringWritePromise(
            this._controllerCodes.controller_customer_number,
            DeviceNetworkId.DRIVE_UNIT,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareParameter1WritePromise(
            this._controllerParameter1,
            this.controllerParameter1Array,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareParameter2WritePromise(
            this._controllerParameter2,
            this.controllerParameter2Array,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareSpeedPackageWritePromise(
            this._controllerSpeedParameters,
            writePromises,
            this.writeShortParameter,
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
            setTimeout(
                () => this.emitter.emit('display-writing-finish', 10, 0),
                300,
            );
            return;
        }
        let wroteSuccessfully = 0,
            wroteUnsuccessfully = 0;
        let writePromises: Promise<boolean>[] = [];
        serializers.prepareStringWritePromise(
            this._displayCodes.display_manufacturer,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.Manufacturer,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareStringWritePromise(
            this._displayCodes.display_customer_number,
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.CustomerNumber,
            writePromises,
            this.writeLongParameter,
        );
        serializers.prepareTotalMileageWritePromise(
            this._displayData.display_total_mileage,
            writePromises,
            this.writeShortParameter,
        );
        serializers.prepareSingleMileageWritePromise(
            this._displayData.display_single_mileage,
            writePromises,
            this.writeShortParameter,
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
            setTimeout(
                () => this.emitter.emit('sensor-writing-finish', 10, 0),
                300,
            );
            return;
        }
        let writePromises: Promise<boolean>[] = [];
        serializers.prepareStringWritePromise(
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
            console.log('time is invalid');
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

    public calibratePositionSensor(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            console.log('Calibrated position sensor');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.CalibratePositionSensor,
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

    public get controllerParameter1(): types.BafangCanControllerParameter1 {
        return deepCopy(this._controllerParameter1);
    }

    public set controllerParameter1(data: types.BafangCanControllerParameter1) {
        this._controllerParameter1 = deepCopy(data);
    }

    public get controllerParameter2(): types.BafangCanControllerParameter2 {
        return deepCopy(this._controllerParameter2);
    }

    public set controllerParameter2(data: types.BafangCanControllerParameter2) {
        this._controllerParameter2 = deepCopy(data);
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
