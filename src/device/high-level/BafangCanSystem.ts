/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { deepCopy } from 'deep-copy-ts';
import path from 'path';
import getAppDataPath from 'appdata-path';
import log from 'electron-log/renderer';
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
import { PromiseControls } from '../../types/common';

type SentRequest = {
    promise: PromiseControls;
    can_operation: CanOperation;
};

type CommandProcessor = { log: boolean; processWriteAnswer: boolean };

type AvailabilityList = {
    controller: {
        device: boolean;
        realtime0: boolean;
        realtime1: boolean;
        parameter1: boolean;
        parameter2: boolean;
        speed_parameter: boolean;
    };
    display: {
        device: boolean;
        error_codes: boolean;
        data1: boolean;
        data2: boolean;
        realtime: boolean;
    };
    sensor: { device: boolean; realtime: boolean };
    battery: {
        device: boolean;
        cells_voltage: boolean;
        capacity_data: boolean;
        state_data: boolean;
    };
};

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: BesstDevice;

    public emitter: EventEmitter;

    private demoDataPublisherInterval: NodeJS.Timeout | undefined;

    private demoRealtimeDataGeneratorInterval: NodeJS.Timeout | undefined;

    private _controllerRealtimeData0: types.BafangCanControllerRealtime0;

    private _controllerRealtimeData1: types.BafangCanControllerRealtime1;

    private _sensorRealtimeData: types.BafangCanSensorRealtime;

    private _controllerParameter1: types.BafangCanControllerParameter1;

    private _controllerParameter2: types.BafangCanControllerParameter2;

    private controllerParameter1Array?: number[];

    private controllerParameter2Array?: number[];

    private _controllerSpeedParameters: types.BafangCanControllerSpeedParameters;

    private _displayData1: types.BafangCanDisplayData1;

    private _displayData2: types.BafangCanDisplayData2;

    private _displayRealtimeData: types.BafangCanDisplayRealtimeData;

    private _displayErrorCodes: number[];

    private _batteryCellsVoltage: number[];

    private _batteryCapacityData: types.BafangCanBatteryCapacityData;

    private _batteryStateData: types.BafangCanBatteryStateData;

    private _controllerCodes: types.BafangCanControllerCodes;

    private _displayCodes: types.BafangCanDisplayCodes;

    private _sensorCodes: types.BafangCanSensorCodes;

    private _batteryCodes: types.BafangCanBatteryCodes;

    private _besstCodes: types.BafangBesstCodes;

    private sentRequests: SentRequest[][][] = [];

    private _availabilityList: AvailabilityList = {
        controller: {
            device: false,
            realtime0: false,
            realtime1: false,
            parameter1: false,
            parameter2: false,
            speed_parameter: false,
        },
        display: {
            device: false,
            error_codes: false,
            data1: false,
            data2: false,
            realtime: false,
        },
        sensor: { device: false, realtime: false },
        battery: {
            device: false,
            cells_voltage: false,
            capacity_data: false,
            state_data: false,
        },
    };

    private readingInProgress: boolean = false;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this._controllerRealtimeData0 = ep.getEmptyControllerRealtime0Data();
        this._controllerRealtimeData1 = ep.getEmptyControllerRealtime1Data();
        this._sensorRealtimeData = ep.getEmptySensorRealtimeData();
        this._controllerParameter1 = ep.getEmptyControllerParameter1();
        this._controllerParameter2 = ep.getEmptyControllerParameter2();
        this._controllerSpeedParameters =
            ep.getEmptyControllerSpeedParameters();
        this._displayData1 = ep.getEmptyDisplayData1();
        this._displayData2 = ep.getEmptyDisplayData2();
        this._displayRealtimeData = ep.getEmptyDisplayRealtimeData();
        this._displayErrorCodes = [];
        this._controllerCodes = ep.getEmptyControllerCodes();
        this._displayCodes = ep.getEmptyDisplayCodes();
        this._batteryCellsVoltage = ep.getEmptyBatteryCellsVoltage();
        this._batteryCapacityData = ep.getEmptyBatteryCapacityData();
        this._batteryStateData = ep.getEmptyBatteryStateData();
        this._sensorCodes = ep.getEmptySensorCodes();
        this._batteryCodes = ep.getEmptyBatteryCodes();
        this._besstCodes = ep.getEmptyBesstCodes();
        this.loadData = this.loadData.bind(this);
        this.saveControllerData = this.saveControllerData.bind(this);
        this.saveDisplayData = this.saveDisplayData.bind(this);
        this.saveSensorData = this.saveSensorData.bind(this);
        this.demoDataPublisher = this.demoDataPublisher.bind(this);
        this.demoRealtimeDataGenerator =
            this.demoRealtimeDataGenerator.bind(this);
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.readParameter = this.readParameter.bind(this);
        this.writeShortParameter = this.writeShortParameter.bind(this);
        this.writeLongParameter = this.writeLongParameter.bind(this);
        this.registerRequest = this.registerRequest.bind(this);
        this.resolveRequest = this.resolveRequest.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.saveBackup = this.saveBackup.bind(this);
    }

    onDisconnect() {
        this.device = undefined;
        this.emitter.emit('disconnection');
    }

    private demoDataPublisher(): void {
        this.emitter.emit(
            'controller-realtime-data-0',
            deepCopy(this._controllerRealtimeData0),
        );
        this.emitter.emit(
            'controller-realtime-data-1',
            deepCopy(this._controllerRealtimeData1),
        );
        this.emitter.emit(
            'display-realtime-data',
            deepCopy(this._displayRealtimeData),
        );
        this.emitter.emit(
            'sensor-realtime-data',
            deepCopy(this._sensorRealtimeData),
        );
        this.emitter.emit(
            'battery-capacity-data',
            deepCopy(this._batteryCapacityData),
        );
        this.emitter.emit(
            'battery-state-data',
            deepCopy(this._batteryStateData),
        );
    }

    private demoRealtimeDataGenerator(): void {
        this._displayRealtimeData = {
            assist_levels: 5,
            ride_mode: types.BafangCanRideMode.ECO,
            boost: false,
            current_assist_level:
                this._displayRealtimeData.current_assist_level === 'walk'
                    ? 5
                    : 'walk',
            light: !this._displayRealtimeData.light,
            button: !this._displayRealtimeData.button,
        };
    }

    private registerRequest(
        source: number,
        target: number,
        can_operation: CanOperation,
        code: number,
        subcode: number,
        promise?: PromiseControls,
        attempt = 1,
    ): void {
        if (promise) {
            if (this.sentRequests[target] === undefined)
                this.sentRequests[target] = [];
            if (this.sentRequests[target][code] === undefined)
                this.sentRequests[target][code] = [];
            this.sentRequests[target][code][subcode] = {
                promise,
                can_operation,
            };
            setTimeout(() => {
                if (this.sentRequests[target][code][subcode]) {
                    if (
                        this.sentRequests[target][code][subcode]
                            .can_operation !== CanOperation.READ_CMD ||
                        attempt >= 3
                    ) {
                        promise.resolve(false);
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
                                promise,
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
            ][response.canCommandSubCode].promise.resolve(success);
            delete this.sentRequests[response.sourceDeviceCode][
                response.canCommandCode
            ][response.canCommandSubCode];
        }
    }

    private commandProcessingTable: {
        [key: number]: { [key: number]: { [key: number]: CommandProcessor } };
    } = {
        0x01: {
            0x60: {
                0x00: { log: true, processWriteAnswer: false },
                0x01: { log: true, processWriteAnswer: false },
                0x02: { log: true, processWriteAnswer: false },
                0x03: { log: true, processWriteAnswer: false },
                0x04: { log: true, processWriteAnswer: true },
            },
            0x31: { 0x00: { log: true, processWriteAnswer: false } },
        },
        0x02: {
            0x60: {
                0x00: { log: true, processWriteAnswer: false },
                0x01: { log: true, processWriteAnswer: false },
                0x02: { log: true, processWriteAnswer: false },
                0x03: { log: true, processWriteAnswer: false },
                0x05: { log: true, processWriteAnswer: true },
            },
            0x32: {
                0x00: { log: false, processWriteAnswer: false },
                0x01: { log: false, processWriteAnswer: false },
                0x03: { log: true, processWriteAnswer: false },
            },
        },
        0x03: {
            0x60: {
                0x00: { log: true, processWriteAnswer: false },
                0x01: { log: true, processWriteAnswer: false },
                0x02: { log: true, processWriteAnswer: false },
                0x03: { log: true, processWriteAnswer: false },
                0x04: { log: true, processWriteAnswer: true },
                0x05: { log: true, processWriteAnswer: true },
                0x07: { log: true, processWriteAnswer: false },
                0x08: { log: true, processWriteAnswer: false },
            },
            0x63: {
                0x00: { log: false, processWriteAnswer: false },
                0x01: { log: true, processWriteAnswer: true },
                0x02: { log: true, processWriteAnswer: true },
            },
        },
        // 0x1f: { 0x63: [], 0x31: { 0x00: [] }, 0x32: {} },
    };

    private processParsedCanResponse(response: BesstReadedCanFrame) {
        this.resolveRequest(response);
        if (response.canCommandCode === 0x60) {
            log.info('received can package:', response);
            if (response.data.length === 0) {
                this.rereadParameter(response);
                return;
            }
            if (response.sourceDeviceCode === DeviceNetworkId.DISPLAY) {
                if (response.canCommandSubCode === 0x07) {
                    this._displayErrorCodes = parsers.parseErrorCodes(response);
                    this._availabilityList.display.error_codes = true;
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
            // code is hmi only
            switch (response.canCommandSubCode) {
                case 0x00:
                    this._displayRealtimeData =
                        parsers.parseDisplayPackage0(response);
                    this._availabilityList.display.realtime = true;
                    this.emitter.emit(
                        'display-realtime-data',
                        deepCopy(this._displayRealtimeData),
                    );
                    break;
                case 0x01:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        this.rereadParameter(response);
                        break;
                    }
                    this._displayData1 = parsers.parseDisplayPackage1(response);
                    this._availabilityList.display.data1 = true;
                    this.emitter.emit(
                        'display-data1',
                        deepCopy(this._displayData1),
                    );
                    break;
                case 0x02:
                    log.info('received can package:', response);
                    if (response.data.length === 0) {
                        this.rereadParameter(response);
                        break;
                    }
                    this._displayData2 = parsers.parseDisplayPackage2(response);
                    this._availabilityList.display.data2 = true;
                    this.emitter.emit(
                        'display-data2',
                        deepCopy(this._displayData2),
                    );
                    break;
                default:
                    break;
            }
        } else if (
            response.canCommandCode === 0x31 &&
            response.canCommandSubCode === 0x00
        ) {
            this._sensorRealtimeData = parsers.parseSensorPackage(response);
            this._availabilityList.sensor.realtime = true;
            this.emitter.emit(
                'sensor-realtime-data',
                deepCopy(this._sensorRealtimeData),
            );
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
            this.demoDataPublisherInterval = setInterval(
                this.demoDataPublisher,
                1500,
            );
            this.demoRealtimeDataGeneratorInterval = setInterval(
                this.demoRealtimeDataGenerator,
                5000,
            );
            console.log('Demo mode: connected');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        this.device = new BesstDevice(this.devicePath);
        this.device?.emitter.on('can', this.processParsedCanResponse);
        this.device?.emitter.on('disconnection', this.onDisconnect);

        return new Promise<boolean>(async (resolve) => {
            this.device?.reset().then(() => {
                this.device?.emitter.removeAllListeners();
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
            clearInterval(this.demoDataPublisherInterval);
            clearInterval(this.demoRealtimeDataGeneratorInterval);
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
            this._sensorRealtimeData = dp.getSensorRealtimeDemoData();
            this._controllerParameter1 = dp.getControllerParameter1Demo();
            this._controllerParameter2 = dp.getControllerParameter2Demo();
            this.controllerParameter1Array =
                dp.getControllerParameter1ArrayDemo();
            this.controllerParameter2Array =
                dp.getControllerParameter2ArrayDemo();
            this._controllerSpeedParameters =
                dp.getControllerSpeedParametersDemo();
            this._displayData1 = dp.getDisplayDemoData1();
            this._displayData2 = dp.getDisplayDemoData2();
            this._displayRealtimeData = dp.getDisplayRealtimeDemoData();
            this._displayErrorCodes = dp.getDisplayErrorCodesDemo();
            this._batteryCellsVoltage = dp.getBatteryCellsVoltageDemo();
            this._batteryCapacityData = dp.getBatteryCapacityDemoData();
            this._batteryStateData = dp.getBatteryStateDemoData();
            this._controllerCodes = dp.getControllerCodesDemo();
            this._displayCodes = dp.getDisplayCodesDemo();
            this._sensorCodes = dp.getSensorCodesDemo();
            this._batteryCodes = dp.getBatteryCodesDemo();
            this._besstCodes = dp.getBesstCodesDemo();
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
                this.emitter.emit(
                    'display-data1',
                    deepCopy(this._displayData1),
                );
                this.emitter.emit(
                    'display-data2',
                    deepCopy(this._displayData2),
                );
                this.emitter.emit(
                    'display-realtime-data',
                    deepCopy(this._displayRealtimeData),
                );
                this.emitter.emit(
                    'battery-cells-data',
                    deepCopy(this._batteryCodes),
                );
                this.emitter.emit(
                    'display-codes-data',
                    deepCopy(this._displayCodes),
                );
                this.emitter.emit(
                    'sensor-codes-data',
                    deepCopy(this._sensorCodes),
                );
                this.emitter.emit(
                    'battery-codes-data',
                    deepCopy(this._batteryCodes),
                );
                this._availabilityList.controller.device = true;
                this._availabilityList.controller.realtime0 = true;
                this._availabilityList.controller.realtime1 = true;
                this._availabilityList.controller.speed_parameter = true;
                this._availabilityList.controller.parameter1 = true;
                this._availabilityList.controller.parameter2 = true;
                this._availabilityList.display.device = true;
                this._availabilityList.display.realtime = true;
                this._availabilityList.display.data1 = true;
                this._availabilityList.display.data2 = true;
                this._availabilityList.display.error_codes = true;
                this._availabilityList.sensor.device = true;
                this._availabilityList.sensor.realtime = true;
                this._availabilityList.battery.device = true;
                this._availabilityList.battery.cells_voltage = true;
                this._availabilityList.battery.capacity_data = true;
                this._availabilityList.battery.state_data = true;
                this.emitter.emit('reading-finish', 10, 0);
            }, 1500);
            console.log('Demo mode: blank data loaded');
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
                    this.readParameter(device, command, { resolve, reject });
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
                        this._availabilityList.display.device =
                            readedDisplay > 0;
                        this._availabilityList.controller.device =
                            readedController > 0;
                        this._availabilityList.sensor.device = readedSensor > 0;
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
            display_data1: this._displayData1,
            display_data2: this._displayData2,
            controller_codes: this._controllerCodes,
            display_codes: this._displayCodes,
            sensor_codes: this._sensorCodes,
            battery_codes: this._batteryCodes,
            controller_available: this._availabilityList.controller.device,
            controller_parameter1_available:
                this._availabilityList.controller.parameter1,
            controller_parameter2_available:
                this._availabilityList.controller.parameter2,
            controller_speed_parameter_available:
                this._availabilityList.controller.speed_parameter,
            display_available: this._availabilityList.display.device,
            sensor_available: this._availabilityList.sensor.device,
            batteru_available: this._availabilityList.battery.device,
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
        promise?: PromiseControls,
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
                    promise,
                ),
            );
    }

    private writeShortParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        promise?: PromiseControls,
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
                    promise,
                ),
            );
    }

    private writeLongParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
        promise?: PromiseControls,
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
                    promise,
                ),
            );
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
        if (this.devicePath === 'demo') {
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
            this._displayData1.display_total_mileage,
            writePromises,
            this.writeShortParameter,
        );
        serializers.prepareSingleMileageWritePromise(
            this._displayData1.display_single_mileage,
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
        if (this.devicePath === 'demo') {
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
        if (this.devicePath === 'demo') {
            console.log(`New display time is ${hours}:${minutes}:${seconds}`);
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.DisplayTime,
                [hours, minutes, seconds],
                { resolve, reject },
            );
        });
    }

    public cleanDisplayServiceMileage(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.CleanServiceMileage,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                { resolve, reject },
            );
        });
    }

    public calibratePositionSensor(): Promise<boolean> {
        if (this.devicePath === 'demo') {
            console.log('Calibrated position sensor');
            return new Promise<boolean>((resolve) => resolve(true));
        }
        return new Promise<boolean>((resolve, reject) => {
            this.writeShortParameter(
                DeviceNetworkId.DRIVE_UNIT,
                CanWriteCommandsList.CalibratePositionSensor,
                [0x00, 0x00, 0x00, 0x00, 0x00],
                { resolve, reject },
            );
        });
    }

    public get isControllerAvailable(): boolean {
        return this._availabilityList.controller.device;
    }

    public get isDisplayAvailable(): boolean {
        return this._availabilityList.display.device;
    }

    public get isSensorAvailable(): boolean {
        return this._availabilityList.sensor.device;
    }

    public get isBatteryAvailable(): boolean {
        return this._availabilityList.battery.device;
    }

    public get isBatteryCellVoltageReady(): boolean {
        return this._availabilityList.battery.cells_voltage;
    }

    public get batteryCellsVoltage(): number[] {
        return deepCopy(this._batteryCellsVoltage);
    }

    public get isBatteryCapacityDataReady(): boolean {
        return this._availabilityList.battery.capacity_data;
    }

    public get batteryCapacityData(): types.BafangCanBatteryCapacityData {
        return deepCopy(this._batteryCapacityData);
    }

    public get isBatteryCurrentStateDataReady(): boolean {
        return this._availabilityList.battery.state_data;
    }

    public get batteryStateData(): types.BafangCanBatteryStateData {
        return deepCopy(this._batteryStateData);
    }

    public get isBatteryCodesAvailable(): boolean {
        return true;
    }

    public get batteryCodes(): types.BafangCanBatteryCodes {
        return deepCopy(this._batteryCodes);
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

    public get isControllerCodesAvailable(): boolean {
        return true;
    }

    public get controllerCodes(): types.BafangCanControllerCodes {
        return deepCopy(this._controllerCodes);
    }

    public set controllerCodes(data: types.BafangCanControllerCodes) {
        this._controllerCodes = deepCopy(data);
    }

    public get isDisplayData1Available(): boolean {
        return this._availabilityList.display.data1;
    }

    public get displayData1(): types.BafangCanDisplayData1 {
        return deepCopy(this._displayData1);
    }

    public set displayData1(data: types.BafangCanDisplayData1) {
        this._displayData1 = deepCopy(data);
    }

    public get isDisplayData2Available(): boolean {
        return this._availabilityList.display.data2;
    }

    public get displayData2(): types.BafangCanDisplayData2 {
        return deepCopy(this._displayData2);
    }

    public get isDisplayRealtimeDataReady(): boolean {
        return this._availabilityList.display.realtime;
    }

    public get displayRealtimeData(): types.BafangCanDisplayRealtimeData {
        return deepCopy(this._displayRealtimeData);
    }

    public get isDisplayErrorCodesAvailable(): boolean {
        return this._availabilityList.display.error_codes;
    }

    public get displayErrorCodes(): number[] {
        return deepCopy(this._displayErrorCodes);
    }

    public get isDisplayCodesAvailable(): boolean {
        return true;
    }

    public get displayCodes(): types.BafangCanDisplayCodes {
        return deepCopy(this._displayCodes);
    }

    public set displayCodes(data: types.BafangCanDisplayCodes) {
        this._displayCodes = deepCopy(data);
    }

    public get isSensorRealtimeDataReady(): boolean {
        return this._availabilityList.sensor.realtime;
    }

    public get sensorRealtimeData(): types.BafangCanSensorRealtime {
        return deepCopy(this._sensorRealtimeData);
    }

    public get isSensorCodesAvailable(): boolean {
        return true;
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
}
