/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import IConnection from './Connection';
import { DeviceName } from '../../types/DeviceType';
import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerParameters1,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanWheelDiameterTable,
} from '../../types/BafangCanSystemTypes';
import { NotAvailable } from '../../types/no_data';
import {
    decodeCurrentAssistLevel,
    getBesstCodesDemo,
    getControllerCodesEmpty,
    getControllerParameters1Demo,
    getControllerRealtimeDemoData,
    getControllerSpeedParametersDemo,
    getDisplayCodesDemo,
    getDisplayDemoData,
    getDisplayRealtimeDemoData,
    getEmptyBesstCodes,
    getEmptyControllerCodes,
    getEmptyControllerParameters1,
    getEmptyControllerRealtimeData,
    getEmptyControllerSpeedParameters,
    getEmptyDisplayCodes,
    getEmptyDisplayData,
    getEmptyDisplayRealtimeData,
    getEmptySensorCodes,
    getEmptySensorRealtimeData,
    getSensorCodesDemo,
    getSensorRealtimeDemoData,
} from '../../utils/BafangCanUtils';
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

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device?: BesstDevice;

    public emitter: EventEmitter;

    private simulationDataPublisherInterval: NodeJS.Timeout | undefined;

    private simulationRealtimeDataGeneratorInterval: NodeJS.Timeout | undefined;

    private _controllerRealtimeData: BafangCanControllerRealtime;

    private _sensorRealtimeData: BafangCanSensorRealtime;

    private _controllerParameters1: BafangCanControllerParameters1;

    private _controllerSpeedParameters: BafangCanControllerSpeedParameters;

    private _displayData: BafangCanDisplayData;

    private _displayState: BafangCanDisplayState;

    private _controllerCodes: BafangCanControllerCodes;

    private _displayCodes: BafangCanDisplayCodes;

    private _sensorCodes: BafangCanSensorCodes;

    private _besstCodes: BafangBesstCodes;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this._controllerRealtimeData = getEmptyControllerRealtimeData();
        this._sensorRealtimeData = getEmptySensorRealtimeData();
        this._controllerParameters1 = getEmptyControllerParameters1();
        this._controllerSpeedParameters = getEmptyControllerSpeedParameters();
        this._displayData = getEmptyDisplayData();
        this._displayState = getEmptyDisplayRealtimeData();
        this._controllerCodes = getEmptyControllerCodes();
        this._displayCodes = getEmptyDisplayCodes();
        this._sensorCodes = getEmptySensorCodes();
        this._besstCodes = getEmptyBesstCodes();
        this.loadData = this.loadData.bind(this);
        this.simulationDataPublisher = this.simulationDataPublisher.bind(this);
        this.simulationRealtimeDataGenerator =
            this.simulationRealtimeDataGenerator.bind(this);
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
        this.readParameter = this.readParameter.bind(this);
        this.writeShortParameter = this.writeShortParameter.bind(this);
    }

    private simulationDataPublisher(): void {
        this.emitter.emit('broadcast-data-controller', {
            ...this._controllerRealtimeData,
        });
        this.emitter.emit('broadcast-data-display', {
            ...this._displayState,
        });
        this.emitter.emit('broadcast-data-sensor', {
            ...this._sensorRealtimeData,
        });
    }

    private simulationRealtimeDataGenerator(): void {
        this._displayState = {
            display_assist_levels: 5,
            display_ride_mode: BafangCanRideMode.ECO,
            display_boost: false,
            display_current_assist_level:
                this._displayState.display_current_assist_level === 'walk'
                    ? 5
                    : 'walk',
            display_light: !this._displayState.display_light,
            display_button: !this._displayState.display_button,
        };
    }

    private processParsedCanResponse(response: BesstReadedCanFrame) {
        if (response.canCommandCode == 0x60) {
            if (response.data.length == 0) {
                this.device?.sendCanFrame(
                    DeviceNetworkId.BESST,
                    response.sourceDeviceCode,
                    CanOperation.READ_CMD,
                    response.canCommandCode,
                    response.canCommandSubCode,
                );
                return;
            }
            if (response.sourceDeviceCode == DeviceNetworkId.DISPLAY) {
                switch (response.canCommandSubCode) {
                    case 0x00:
                        this._displayCodes.display_hardware_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x01:
                        this._displayCodes.display_software_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x02:
                        this._displayCodes.display_model_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x03:
                        this._displayCodes.display_serial_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x04:
                        this._displayCodes.display_customer_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x05:
                        this._displayCodes.display_manufacturer =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x08:
                        this._displayCodes.display_bootload_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    default:
                        break;
                }
                this.emitter.emit('display-codes-data', {
                    ...this._displayCodes,
                });
            } else if (
                response.sourceDeviceCode == DeviceNetworkId.DRIVE_UNIT
            ) {
                switch (response.canCommandSubCode) {
                    case 0x00:
                        this._controllerCodes.controller_hardware_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x01:
                        this._controllerCodes.controller_software_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x02:
                        this._controllerCodes.controller_model_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x03:
                        this._controllerCodes.controller_serial_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x04:
                        this._controllerCodes.controller_customer_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x05:
                        this._controllerCodes.controller_manufacturer =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x08:
                        this._controllerCodes.controller_bootload_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    default:
                        break;
                }
                this.emitter.emit('controller-codes-data', {
                    ...this._controllerCodes,
                });
            } else if (
                response.sourceDeviceCode == DeviceNetworkId.TORQUE_SENSOR
            ) {
                switch (response.canCommandSubCode) {
                    case 0x00:
                        this._sensorCodes.sensor_hardware_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x01:
                        this._sensorCodes.sensor_software_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x02:
                        this._sensorCodes.sensor_model_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x03:
                        this._sensorCodes.sensor_serial_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x04:
                        this._sensorCodes.sensor_customer_number =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x05:
                        this._sensorCodes.sensor_manufacturer =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    case 0x08:
                        this._sensorCodes.sensor_bootload_version =
                            String.fromCharCode.apply(null, response.data);
                        break;
                    default:
                        break;
                }
                this.emitter.emit('sensor-codes-data', {
                    ...this._sensorCodes,
                });
            }
        } else if (response.canCommandCode == 0x63) {
            //code is hmi only
            switch (response.canCommandSubCode) {
                case 0x00:
                    this._displayState.display_assist_levels =
                        response.data[0] & 0b1111;
                    (this._displayState.display_ride_mode =
                        response.data[0] & 0b10000
                            ? BafangCanRideMode.BOOST
                            : BafangCanRideMode.ECO),
                        (this._displayState.display_boost =
                            (response.data[0] & 0b100000) >> 5 === 1);
                    this._displayState.display_current_assist_level =
                        decodeCurrentAssistLevel(
                            response.data[1],
                            response.data[0] & 0b1111,
                        );
                    this._displayState.display_light =
                        (response.data[2] & 1) === 1;
                    this._displayState.display_button =
                        (response.data[2] & 0b10) >> 1 === 1;
                    this.emitter.emit('broadcast-data-display', {
                        ...this._displayState,
                    });
                    break;
                case 0x01:
                    if (response.data.length == 0) {
                        this.device?.sendCanFrame(
                            DeviceNetworkId.BESST,
                            DeviceNetworkId.DISPLAY,
                            CanOperation.READ_CMD,
                            CanReadCommandsList.DisplayDataBlock1
                                .canCommandCode,
                            CanReadCommandsList.DisplayDataBlock1
                                .canCommandSubCode,
                        );
                        break;
                    }
                    this._displayData.display_total_mileage =
                        (response.data[2] << 16) +
                        (response.data[1] << 8) +
                        response.data[0];
                    this._displayData.display_single_mileage =
                        ((response.data[5] << 16) +
                            (response.data[4] << 8) +
                            response.data[3]) /
                        10;
                    this._displayData.display_max_speed =
                        ((response.data[7] << 8) + response.data[6]) / 10;
                    this.emitter.emit('display-general-data', {
                        ...this._displayData,
                    });
                    break;
                case 0x02:
                    if (response.data.length == 0) {
                        this.device?.sendCanFrame(
                            DeviceNetworkId.BESST,
                            DeviceNetworkId.DISPLAY,
                            CanOperation.READ_CMD,
                            CanReadCommandsList.DisplayDataBlock2
                                .canCommandCode,
                            CanReadCommandsList.DisplayDataBlock2
                                .canCommandSubCode,
                        );
                        break;
                    }
                    this._displayData.display_average_speed =
                        ((response.data[1] << 8) + response.data[0]) / 10;
                    this._displayData.display_service_mileage =
                        ((response.data[4] << 16) +
                            (response.data[3] << 8) +
                            response.data[2]) /
                        10;
                    this.emitter.emit('display-general-data', {
                        ...this._displayData,
                    });
                    break;
                case 0x03:
                    break;
                default:
                    break;
            }
        } else if (
            response.canCommandCode == 0x31 &&
            response.canCommandSubCode == 0x00
        ) {
            this._sensorRealtimeData.sensor_torque =
                (response.data[1] << 8) + response.data[0];
            this._sensorRealtimeData.sensor_cadence = response.data[2];
            this.emitter.emit('broadcast-data-sensor', {
                ...this._sensorRealtimeData,
            });
        } else if (response.canCommandCode == 0x32) {
            switch (response.canCommandSubCode) {
                case 0x00:
                    let tem = (response.data[7] << 8) + response.data[6];
                    this._controllerRealtimeData.controller_remaining_capacity =
                        response.data[0];
                    this._controllerRealtimeData.controller_single_trip =
                        ((response.data[2] << 8) + response.data[1]) / 100;
                    this._controllerRealtimeData.controller_cadence =
                        response.data[3];
                    this._controllerRealtimeData.controller_torque =
                        (response.data[5] << 8) + response.data[4];
                    this._controllerRealtimeData.controller_remaining_distance =
                        tem < 65535 ? tem / 100 : NotAvailable;
                    this.emitter.emit('broadcast-data-controller', {
                        ...this._controllerRealtimeData,
                    });
                    break;
                case 0x01:
                    this._controllerRealtimeData.controller_speed =
                        ((response.data[1] << 8) + response.data[0]) / 100;
                    this._controllerRealtimeData.controller_current =
                        ((response.data[3] << 8) + response.data[2]) / 100;
                    this._controllerRealtimeData.controller_voltage =
                        ((response.data[5] << 8) + response.data[4]) / 100;
                    this._controllerRealtimeData.controller_temperature =
                        response.data[6] - 40;
                    this._controllerRealtimeData.controller_motor_temperature =
                        response.data[7] === 255
                            ? NotAvailable
                            : response.data[7] - 40;
                    this.emitter.emit('broadcast-data-controller', {
                        ...this._controllerRealtimeData,
                    });
                    break;
                case 0x03:
                    let diameter = BafangCanWheelDiameterTable.find(
                        (item) =>
                            item.code[0] == response.data[2] &&
                            item.code[1] == response.data[3],
                    );
                    this._controllerSpeedParameters.controller_speed_limit =
                        ((response.data[1] << 8) + response.data[0]) / 100;
                    if (diameter)
                        this._controllerSpeedParameters.controller_wheel_diameter =
                            diameter;
                    this._controllerSpeedParameters.controller_circumference =
                        (response.data[5] << 8) + response.data[4];
                    this.emitter.emit('controller-speed-data', {
                        ...this._controllerSpeedParameters,
                    });
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
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
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
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
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
            this._controllerRealtimeData = getControllerRealtimeDemoData();
            this._sensorRealtimeData = getSensorRealtimeDemoData();
            this._controllerParameters1 = getControllerParameters1Demo();
            this._controllerSpeedParameters =
                getControllerSpeedParametersDemo();
            this._displayData = getDisplayDemoData();
            this._displayState = getDisplayRealtimeDemoData();
            this._controllerCodes = getControllerCodesEmpty();
            this._displayCodes = getDisplayCodesDemo();
            this._sensorCodes = getSensorCodesDemo();
            this._besstCodes = getBesstCodesDemo();
            setTimeout(() => {
                this.emitter.emit('controller-codes-data', {
                    ...this._controllerCodes,
                });
                this.emitter.emit('controller-speed-data', {
                    ...this._controllerSpeedParameters,
                });
                this.emitter.emit('display-general-data', {
                    ...this._displayData,
                });
                this.emitter.emit('broadcast-data-display', {
                    ...this._displayState,
                });
                this.emitter.emit('display-codes-data', {
                    ...this._displayCodes,
                });
                this.emitter.emit('sensor-codes-data', {
                    ...this._sensorCodes,
                });
            }, 1500);
            console.log('Simulator: blank data loaded');
            return;
        }
        this.device?.getSerialNumber().then((serial_number: string) => {
            this._besstCodes.besst_serial_number = serial_number;
            this.emitter.emit('besst-data', {
                ...this._besstCodes,
            });
        });
        this.device?.getSoftwareVersion().then((software_version: string) => {
            this._besstCodes.besst_software_version = software_version;
            this.emitter.emit('besst-data', {
                ...this._besstCodes,
            });
        });
        this.device?.getHardwareVersion().then((hardware_version: string) => {
            this._besstCodes.besst_hardware_version = hardware_version;
            this.emitter.emit('besst-data', {
                ...this._besstCodes,
            });
        });
        const basicCommands = [
            CanReadCommandsList.HardwareVersion,
            CanReadCommandsList.SoftwareVersion,
            CanReadCommandsList.ModelNumber,
            CanReadCommandsList.SerialNumber,
            CanReadCommandsList.CustomerNumber,
            CanReadCommandsList.Manufacturer,
            CanReadCommandsList.BootloaderVersion,
        ];
        const commandsToDisplay = [
            CanReadCommandsList.DisplayDataBlock1,
            CanReadCommandsList.DisplayDataBlock2,
        ];
        const commandsToMotor = [CanReadCommandsList.MotorSpeedParameters];
        basicCommands.forEach((command) => {
            this.readParameter(DeviceNetworkId.DISPLAY, command);
        });
        commandsToDisplay.forEach((command) => {
            this.readParameter(DeviceNetworkId.DISPLAY, command);
        });
        basicCommands.forEach((command) => {
            this.readParameter(DeviceNetworkId.DRIVE_UNIT, command);
        });
        commandsToMotor.forEach((command) => {
            this.readParameter(DeviceNetworkId.DRIVE_UNIT, command);
        });
        basicCommands.forEach((command) => {
            this.readParameter(DeviceNetworkId.TORQUE_SENSOR, command);
        });
    }

    private readParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
    ): void {
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.READ_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
        );
    }

    private writeShortParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
    ): void {
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.WRITE_CMD,
            can_command.canCommandCode,
            can_command.canCommandSubCode,
            value,
        );
    }

    private writeLongParameter(
        target: DeviceNetworkId,
        can_command: CanCommand,
        value: number[],
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
        this.device?.sendCanFrame(
            DeviceNetworkId.BESST,
            target,
            CanOperation.MULTIFRAME_END,
            0,
            packages,
            arrayClone.slice(0, 8),
        );
    }

    public saveData(): boolean {
        if (this.devicePath === 'simulator') {
            return true;
        }
        if (typeof this._displayData.display_total_mileage == 'number') {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.DisplayTotalMileage,
                [
                    this._displayData.display_total_mileage & 0b11111111,
                    (this._displayData.display_total_mileage &
                        0b1111111100000000) >>
                        8,
                    (this._displayData.display_total_mileage &
                        0b111111110000000000000000) >>
                        16,
                ],
            );
        }
        if (typeof this._displayData.display_single_mileage == 'number') {
            this.writeShortParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.DisplaySingleMileage,
                [
                    (this._displayData.display_single_mileage * 10) &
                        0b11111111,
                    ((this._displayData.display_single_mileage * 10) &
                        0b1111111100000000) >>
                        8,
                    ((this._displayData.display_single_mileage * 10) &
                        0b111111110000000000000000) >>
                        16,
                ],
            );
            this.readParameter(
                DeviceNetworkId.DISPLAY,
                CanReadCommandsList.DisplayDataBlock2,
            );
        }
        if (typeof this._displayCodes.display_serial_number == 'string') {
            this.writeLongParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.SerialNumber,
                [
                    ...Buffer.from(
                        this.displayCodes.display_serial_number as string,
                    ),
                ],
            );
        }
        if (typeof this._displayCodes.display_manufacturer == 'string') {
            this.writeLongParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.Manufacturer,
                [
                    ...Buffer.from(
                        this.displayCodes.display_manufacturer as string,
                    ),
                ],
            );
        }
        if (typeof this._displayCodes.display_customer_number == 'string') {
            this.writeLongParameter(
                DeviceNetworkId.DISPLAY,
                CanWriteCommandsList.CustomerNumber,
                [
                    ...Buffer.from(
                        this.displayCodes.display_customer_number as string,
                    ),
                ],
            );
        }
        return true;
    }

    public setDisplayTime(
        hours: number,
        minutes: number,
        seconds: number,
    ): Promise<boolean> {
        if (
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59 ||
            seconds < 0 ||
            seconds > 59
        ) {
            return new Promise<boolean>((resolve) => {
                resolve(false);
            });
        }
        if (this.devicePath === 'simulator') {
            console.log(`New display time is ${hours}:${minutes}:${seconds}`);
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        this.writeShortParameter(
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.DisplayTime,
            [hours, minutes, seconds],
        );
        return new Promise<boolean>((resolve) => {
            resolve(true); //TODO add check
        });
    }

    public cleanDisplayServiceMileage(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        this.writeShortParameter(
            DeviceNetworkId.DISPLAY,
            CanWriteCommandsList.CleanServiceMileage,
            [0x00, 0x00, 0x00, 0x00, 0x00],
        );
        return new Promise<boolean>((resolve) => {
            resolve(true); //TODO add check
        });
    }

    public get controllerCodes(): BafangCanControllerCodes {
        return { ...this._controllerCodes };
    }

    public get controllerRealtimeData(): BafangCanControllerRealtime {
        return { ...this._controllerRealtimeData };
    }

    public get controllerParameters1(): BafangCanControllerParameters1 {
        return { ...this._controllerParameters1 };
    }

    public get controllerSpeedParameters(): BafangCanControllerSpeedParameters {
        return { ...this._controllerSpeedParameters };
    }

    public get displayData(): BafangCanDisplayData {
        return { ...this._displayData };
    }

    public get displayRealtimeData(): BafangCanDisplayState {
        return { ...this._displayState };
    }

    public get displayCodes(): BafangCanDisplayCodes {
        return { ...this._displayCodes };
    }

    public get sensorRealtimeData(): BafangCanSensorRealtime {
        return { ...this._sensorRealtimeData };
    }

    public get sensorCodes(): BafangCanSensorCodes {
        return { ...this._sensorCodes };
    }

    public get besstCodes(): BafangBesstCodes {
        return { ...this._besstCodes };
    }

    public set controllerParameters1(data: BafangCanControllerParameters1) {
        this._controllerParameters1 = { ...data };
    }

    public set controllerSpeedParameters(
        data: BafangCanControllerSpeedParameters,
    ) {
        this._controllerSpeedParameters = { ...data };
    }

    public set displayData(data: BafangCanDisplayData) {
        this._displayData = { ...data };
    }

    public set controllerCodes(data: BafangCanControllerCodes) {
        this._controllerCodes = { ...data };
    }

    public set displayCodes(data: BafangCanDisplayCodes) {
        this._displayCodes = { ...data };
    }

    public set sensorCodes(data: BafangCanSensorCodes) {
        this._sensorCodes = { ...data };
    }

    public set besstCodes(data: BafangBesstCodes) {
        this._besstCodes = { ...data };
    }
}
