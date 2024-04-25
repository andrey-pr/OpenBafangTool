/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { DeviceName } from '../models/DeviceType';
import IConnection from './Connection';
import {
    BafangBesstCodes,
    BafangCanAssistLevel,
    BafangCanControllerCodes,
    BafangCanControllerParameters1,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanMotorType,
    BafangCanPedalSensorType,
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanTemperatureSensorType,
    BafangCanWheelDiameterTable,
} from '../types/BafangCanSystemTypes';
import HID from 'node-hid';
import { NotLoadedYet } from '../types/no_data';
import { CanOperation, DeviceNetworkId, BesstRequestType, CanCommandsList } from '../constants/BafangCanConstants';
import { decodeCurrentAssistLevel, hexMsgDecoder } from '../utils/BafangCanUtils';



type BesstRequestPacket = {
    data: number[];
    interval: number;
    type: BesstRequestType;
};

type BesstCanResponsePacket = {
    canCommandCode: number;
    canCommandSubCode: number;
    canOperationCode: CanOperation;
    sourceDeviceCode: DeviceNetworkId;
    targetDeviceCode: DeviceNetworkId;
    dataLength: number;
    data: number[];
};

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device: HID.HID | null = null;

    public emitter: EventEmitter;

    private simulationDataPublisherInterval: NodeJS.Timeout | undefined;

    private simulationRealtimeDataGeneratorInterval: NodeJS.Timeout | undefined;

    private controllerRealtimeData: BafangCanControllerRealtime;

    private sensorRealtimeData: BafangCanSensorRealtime;

    private _controllerParameters1: BafangCanControllerParameters1;

    private _controllerSpeedParameters: BafangCanControllerSpeedParameters;

    private _displayData: BafangCanDisplayData;

    private _displayState: BafangCanDisplayState;

    private _controllerCodes: BafangCanControllerCodes;

    private _displayCodes: BafangCanDisplayCodes;

    private _sensorCodes: BafangCanSensorCodes;

    private _besstCodes: BafangBesstCodes;

    private packetQueue: BesstRequestPacket[] = [];

    private lastMultipacketCanCommand: {
        [key: number]: BesstCanResponsePacket;
    } = [];

    private packetQueueBlockTime: number = 0;

    constructor(devicePath: string) {
        this.devicePath = devicePath;
        this.emitter = new EventEmitter();
        this.controllerRealtimeData = {
            controller_cadence: NotLoadedYet,
            controller_torque: NotLoadedYet,
            controller_speed: NotLoadedYet,
            controller_current: NotLoadedYet,
            controller_voltage: NotLoadedYet,
            controller_temperature: NotLoadedYet,
            controller_motor_temperature: NotLoadedYet,
            controller_walk_assistance: NotLoadedYet,
            controller_calories: NotLoadedYet,
            controller_remaining_capacity: NotLoadedYet,
            controller_single_trip: NotLoadedYet,
            controller_remaining_distance: NotLoadedYet,
        };
        this.sensorRealtimeData = {
            sensor_torque: NotLoadedYet,
            sensor_cadence: NotLoadedYet,
        };
        this._controllerParameters1 = {
            controller_system_voltage: 36,
            controller_current_limit: 0,
            controller_overvoltage: 0,
            controller_undervoltage: 0,
            controller_undervoltage_under_load: 0,
            controller_battery_recovery_voltage: 0,
            controller_battery_capacity: 0,
            controller_max_current_on_low_charge: 0,
            controller_full_capacity_range: 0,
            controller_pedal_sensor_type: BafangCanPedalSensorType.TorqueSensor,
            controller_coaster_brake: false,
            controller_speed_sensor_channel_number: 1,
            controller_motor_type: BafangCanMotorType.HubMotor,
            controller_motor_pole_pair_number: 0,
            controller_magnets_on_speed_sensor: 0,
            controller_temperature_sensor_type:
                BafangCanTemperatureSensorType.NoSensor,
            controller_deceleration_ratio: 0,
            controller_motor_max_rotor_rpm: 0,
            controller_motor_d_axis_inductance: 0,
            controller_motor_q_axis_inductance: 0,
            controller_motor_phase_resistance: 0,
            controller_motor_reverse_potential_coefficient: 0,
            controller_throttle_start_voltage: 0,
            controller_throttle_max_voltage: 0,
            controller_pas_start_current: 0,
            controller_pas_current_loading_time: 0,
            controller_pas_current_load_shedding_time: 0,
            controller_assist_levels: [
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
                { current_limit: 0, speed_limit: 0 },
            ],
            controller_displayless_mode: false,
            controller_lamps_always_on: false,
        };
        this._controllerSpeedParameters = {
            controller_wheel_diameter: NotLoadedYet,
            controller_speed_limit: NotLoadedYet,
            controller_circumference: NotLoadedYet,
        };
        this._displayData = {
            display_total_mileage: NotLoadedYet,
            display_single_mileage: NotLoadedYet,
            display_max_speed: NotLoadedYet,
            display_average_speed: NotLoadedYet,
            display_service_mileage: NotLoadedYet,
            display_last_shutdown_time: NotLoadedYet,
        };
        this._displayState = {
            display_assist_levels: NotLoadedYet,
            display_ride_mode: NotLoadedYet,
            display_boost: NotLoadedYet,
            display_current_assist_level: NotLoadedYet,
            display_light: NotLoadedYet,
            display_button: NotLoadedYet,
        };
        this._controllerCodes = {
            controller_hardware_version: NotLoadedYet,
            controller_software_version: NotLoadedYet,
            controller_model_number: NotLoadedYet,
            controller_serial_number: NotLoadedYet,
            controller_customer_number: NotLoadedYet,
            controller_manufacturer: NotLoadedYet,
            controller_bootload_version: NotLoadedYet,
        };
        this._displayCodes = {
            display_hardware_version: NotLoadedYet,
            display_software_version: NotLoadedYet,
            display_model_number: NotLoadedYet,
            display_serial_number: NotLoadedYet,
            display_customer_number: NotLoadedYet,
            display_manufacturer: NotLoadedYet,
            display_bootload_version: NotLoadedYet,
        };
        this._sensorCodes = {
            sensor_hardware_version: NotLoadedYet,
            sensor_software_version: NotLoadedYet,
            sensor_model_number: NotLoadedYet,
            sensor_serial_number: NotLoadedYet,
            sensor_customer_number: NotLoadedYet,
            sensor_manufacturer: NotLoadedYet,
            sensor_bootload_version: NotLoadedYet,
        };
        this._besstCodes = {
            besst_hardware_version: NotLoadedYet,
            besst_software_version: NotLoadedYet,
            besst_serial_number: NotLoadedYet,
        };
        this.loadData = this.loadData.bind(this);
        this.simulationDataPublisher = this.simulationDataPublisher.bind(this);
        this.simulationRealtimeDataGenerator =
            this.simulationRealtimeDataGenerator.bind(this);
        this.processRequestQueue = this.processRequestQueue.bind(this);
        // this.processResponseBesstPacket =
        //     this.processResponseBesstPacket.bind(this);
        this.processBesstResponsePacket = this.processBesstResponsePacket.bind(this);
        this.processResponseCanPacket =
            this.processResponseCanPacket.bind(this);
        this.processParsedCanResponse =
            this.processParsedCanResponse.bind(this);
    }

    private simulationDataPublisher(): void {
        this.emitter.emit('broadcast-data-controller', {
            ...this.controllerRealtimeData,
        });
        this.emitter.emit('broadcast-data-display', {
            ...this._displayState,
        });
        this.emitter.emit('broadcast-data-sensor', {
            ...this.sensorRealtimeData,
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

    private static buildCanCommandSubpacket(
        source: number,
        target: number,
        canOperationCode: number,
        canCommandCode: number,
        canCommandSubCode: number,
    ): number[] {
        return [
            canCommandSubCode,
            canCommandCode,
            ((target & 0b11111) << 3) + (canOperationCode & 0b111),
            source & 0b11111,
        ];
    }

    private static generateBesstRequestPacket(
        actionCode: number,
        cmd: number[],
        data: number[] = [0],
    ) {
        let msg = [
            0,
            actionCode || 0x15,
            0,
            0,
            ...cmd,
            data.length || 0,
            ...data,
        ];
        msg = [...msg, ...new Array(65 - msg.length).fill(0)];
        let interval;
        switch (actionCode) {
            case BesstRequestType.BESST_HW:
            case BesstRequestType.BESST_SW:
            case BesstRequestType.BESST_SN:
                interval = 90;
                break;
            case BesstRequestType.CAN_REQUEST:
                interval = 120;
                break;
            case BesstRequestType.BESST_RESET:
                interval = 5000;
                break;
            default:
                interval = 1000;
                break;
        }
        return {
            data: msg,
            interval: interval,
            type: actionCode,
        };
    }

    private static parseCanResponseFromBesst(
        array: number[],
    ): BesstCanResponsePacket[] {
        let packets: BesstCanResponsePacket[] = [];
        array = array.slice(3);
        while (array.length > 0) {
            if (array.slice(0, 13).filter((value) => value != 0).length !== 0) {
                packets.push({
                    canCommandCode: array[1],
                    canCommandSubCode: array[0],
                    canOperationCode: array[2] & 0b0111,
                    sourceDeviceCode: array[3] & 0b1111,
                    targetDeviceCode: (array[2] & 0b01111000) >> 3,
                    dataLength: array[4],
                    data: array.slice(5, 5 + array[4]),
                });
            }
            array = array.slice(13);
        }

        return packets;
    }

    private processRequestQueue(): void {
        if (this.packetQueue.length === 0) {
            setTimeout(this.processRequestQueue, 100);
            return;
        }
        if (Date.now() < this.packetQueueBlockTime) {
            setTimeout(
                this.processRequestQueue,
                this.packetQueueBlockTime - Date.now() + 10,
            );
            return;
        }
        let packet = this.packetQueue.shift() as BesstRequestPacket;
        this.device?.write(packet.data);
        this.packetQueueBlockTime = Date.now() + packet.interval;
        setTimeout(this.processRequestQueue, packet.interval + 10);
    }

    private processBesstResponsePacket(data: Uint8Array): void {
        if (data.length === 0) return;
        let array: number[] = [...data];
        switch (array[0]) {
            case 0x10:
            case 0x11:
                console.log('UART bike connected - its not supported');
                break;
            case BesstRequestType.CAN_RESPONSE:
                BafangCanSystem.parseCanResponseFromBesst(array).forEach(
                    this.processResponseCanPacket,
                );
                break;
            case BesstRequestType.BESST_HW:
                this._besstCodes.besst_hardware_version =
                    hexMsgDecoder(array);
                this.emitter.emit('besst-data', { ...this._besstCodes });
                break;
            case BesstRequestType.BESST_SN:
                this._besstCodes.besst_serial_number =
                    hexMsgDecoder(array);
                this.emitter.emit('besst-data', { ...this._besstCodes });
                break;
            case BesstRequestType.BESST_SW:
                this._besstCodes.besst_software_version =
                    hexMsgDecoder(array);
                this.emitter.emit('besst-data', { ...this._besstCodes });
                break;
            case BesstRequestType.BESST_RESET:
                break;
            default:
                console.log('Unknown message type - not supperted yet');
                break;
        }
    }

    private processResponseCanPacket(packet: BesstCanResponsePacket): void {
        if (packet.targetDeviceCode === DeviceNetworkId.BESST) {
            switch (packet.canOperationCode) {
                case CanOperation.LONG_START_CMD:
                    this.lastMultipacketCanCommand[packet.sourceDeviceCode] =
                        packet;
                    this.lastMultipacketCanCommand[
                        packet.sourceDeviceCode
                    ].data = [];
                    this.packetQueue.unshift(
                        BafangCanSystem.generateBesstRequestPacket(
                            BesstRequestType.CAN_REQUEST,
                            BafangCanSystem.buildCanCommandSubpacket(
                                this.lastMultipacketCanCommand[
                                    packet.sourceDeviceCode
                                ].targetDeviceCode,
                                this.lastMultipacketCanCommand[
                                    packet.sourceDeviceCode
                                ].sourceDeviceCode,
                                CanOperation.NORMAL_ACK,
                                this.lastMultipacketCanCommand[
                                    packet.sourceDeviceCode
                                ].canCommandCode,
                                this.lastMultipacketCanCommand[
                                    packet.sourceDeviceCode
                                ].canCommandSubCode,
                            ),
                        ),
                    );
                    break;
                case CanOperation.LONG_TRANG_CMD:
                    //reading data
                    if (
                        this.lastMultipacketCanCommand[packet.sourceDeviceCode]
                    ) {
                        this.lastMultipacketCanCommand[
                            packet.sourceDeviceCode
                        ].data = [
                            ...this.lastMultipacketCanCommand[
                                packet.sourceDeviceCode
                            ].data,
                            ...packet.data,
                        ];
                        this.packetQueue.unshift(
                            BafangCanSystem.generateBesstRequestPacket(
                                BesstRequestType.CAN_REQUEST,
                                BafangCanSystem.buildCanCommandSubpacket(
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].targetDeviceCode,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].sourceDeviceCode,
                                    CanOperation.NORMAL_ACK,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].canCommandCode,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].canCommandSubCode,
                                ),
                            ),
                        );
                    }
                    break;
                case CanOperation.LONG_END_CMD:
                    if (
                        this.lastMultipacketCanCommand[packet.sourceDeviceCode]
                    ) {
                        this.lastMultipacketCanCommand[
                            packet.sourceDeviceCode
                        ].data = [
                            ...this.lastMultipacketCanCommand[
                                packet.sourceDeviceCode
                            ].data,
                            ...packet.data,
                        ];
                        this.processParsedCanResponse(
                            this.lastMultipacketCanCommand[
                                packet.sourceDeviceCode
                            ],
                        );
                        this.packetQueue.unshift(
                            BafangCanSystem.generateBesstRequestPacket(
                                BesstRequestType.CAN_REQUEST,
                                BafangCanSystem.buildCanCommandSubpacket(
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].targetDeviceCode,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].sourceDeviceCode,
                                    CanOperation.NORMAL_ACK,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].canCommandCode,
                                    this.lastMultipacketCanCommand[
                                        packet.sourceDeviceCode
                                    ].canCommandSubCode,
                                ),
                            ),
                        );
                        delete this.lastMultipacketCanCommand[
                            packet.sourceDeviceCode
                        ];
                    }
                    break;
                case CanOperation.NORMAL_ACK:
                    this.processParsedCanResponse(packet);
                    break;
                default:
                    break;
            }
        } else if (
            packet.targetDeviceCode === DeviceNetworkId.DRIVE_UNIT &&
            packet.sourceDeviceCode === DeviceNetworkId.DISPLAY
        ) {
            switch (packet.canOperationCode) {
                case CanOperation.WRITE_CMD:
                    this.processParsedCanResponse(packet);
                    break;
                default:
                    break;
            }
        }
    }

    private processParsedCanResponse(response: BesstCanResponsePacket) {
        if (response.canCommandCode == 0x60) {
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
            }
            else if (response.sourceDeviceCode == DeviceNetworkId.DRIVE_UNIT) {
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
            }
            else if (response.sourceDeviceCode == DeviceNetworkId.TORQUE_SENSOR) {
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
        } else if (response.canCommandCode == 0x63) { //code is hmi only
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
        }
    }//TODO

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
        this.device = new HID.HID(this.devicePath);
        let vid = this.device.getDeviceInfo().vendorId;
        let pid = this.device.getDeviceInfo().productId;
        this.device.write(
            BafangCanSystem.generateBesstRequestPacket(
                BesstRequestType.BESST_RESET,
                [0, 0, 0, 0],
            ).data,
        );
        return new Promise<boolean>(async (resolve) => {
            await sleep(3000);
            this.device = new HID.HID(vid, pid);
            this.device.addListener('data', this.processBesstResponsePacket);
            setTimeout(this.processRequestQueue, 100);
            resolve(true);
        });
    }

    public disconnect(): void {
        if (this.devicePath === 'simulator') {
            console.log('Simulator disconnected');
            clearInterval(this.simulationDataPublisherInterval);
            clearInterval(this.simulationRealtimeDataGeneratorInterval);
            return;
        }
        this.device?.removeAllListeners();
        this.device = null;
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
            this.controllerRealtimeData = {
                controller_cadence: 0,
                controller_torque: 750,
                controller_speed: 0,
                controller_current: 0,
                controller_voltage: 29.7,
                controller_temperature: 24,
                controller_motor_temperature: 25,
                controller_walk_assistance: false,
                controller_calories: 0,
                controller_remaining_capacity: 0,
                controller_single_trip: 0,
                controller_remaining_distance: 0,
            };
            this.sensorRealtimeData = {
                sensor_torque: 750,
                sensor_cadence: 0,
            };
            this._controllerParameters1 = {
                //TODO add controller parameters 3
                controller_system_voltage: 36, //TODO fill with data
                controller_current_limit: 1,
                controller_overvoltage: 1,
                controller_undervoltage: 1,
                controller_undervoltage_under_load: 1,
                controller_battery_recovery_voltage: 1,
                controller_battery_capacity: 1,
                controller_max_current_on_low_charge: 1,
                controller_full_capacity_range: 1,
                controller_pedal_sensor_type:
                    BafangCanPedalSensorType.TorqueSensor,
                controller_coaster_brake: false,
                controller_speed_sensor_channel_number: 1,
                controller_motor_type: BafangCanMotorType.HubMotor,
                controller_motor_pole_pair_number: 1,
                controller_magnets_on_speed_sensor: 1,
                controller_temperature_sensor_type:
                    BafangCanTemperatureSensorType.NoSensor,
                controller_deceleration_ratio: 1,
                controller_motor_max_rotor_rpm: 1,
                controller_motor_d_axis_inductance: 1,
                controller_motor_q_axis_inductance: 1,
                controller_motor_phase_resistance: 1,
                controller_motor_reverse_potential_coefficient: 1,
                controller_throttle_start_voltage: 1,
                controller_throttle_max_voltage: 1,
                controller_pas_start_current: 1,
                controller_pas_current_loading_time: 1,
                controller_pas_current_load_shedding_time: 1,
                controller_assist_levels: [
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                    { current_limit: 1, speed_limit: 1 },
                ],
                controller_displayless_mode: false,
                controller_lamps_always_on: false,
            };
            this._controllerSpeedParameters = {
                controller_wheel_diameter: BafangCanWheelDiameterTable[14],
                controller_speed_limit: 25,
                controller_circumference: 2224,
            };
            this._displayData = {
                display_total_mileage: 10000,
                display_single_mileage: 1000,
                display_max_speed: 0,
                display_average_speed: 0,
                display_service_mileage: 0,
                display_last_shutdown_time: 5,
            };
            this._displayState = {
                display_assist_levels: 5,
                display_ride_mode: BafangCanRideMode.ECO,
                display_boost: false,
                display_current_assist_level: 0,
                display_light: false,
                display_button: false,
            };
            this._controllerCodes = {
                controller_hardware_version: 'CR X10V.350.FC 2.1',
                controller_software_version: 'CRX10VC3615E101004.0',
                controller_model_number: 'CR X10V.350.FC',
                controller_serial_number: 'CRX10V.350.FC2.1A42F5TB045999',
                controller_customer_number: '', //TODO
                controller_manufacturer: 'BAFANG',
                controller_bootload_version: '1', //TODO
            };
            this._displayCodes = {
                display_hardware_version: 'DP C221.C 2.0',
                display_software_version: 'DPC221CE10205.1',
                display_model_number: 'DP C221.CAN',
                display_serial_number: 'DPC221.C2.0702F8WC080505',
                display_customer_number: '0049-0074',
                display_manufacturer: 'BAFANG',
                display_bootload_version: 'APM32.DPCAN.V3.0.1',
            };
            this._sensorCodes = {
                sensor_hardware_version: 'SR PA212.32.ST.C 1.0',
                sensor_software_version: 'SRPA212CF10101.0',
                sensor_model_number: 'SR PA212.32.ST.C',
                sensor_serial_number: '0000000000',
                sensor_customer_number: '1', //TODO
                sensor_manufacturer: '1', //TODO
                sensor_bootload_version: '1', //TODO
            };
            this._besstCodes = {
                besst_hardware_version: 'BESST.UC 3.0.3',
                besst_software_version: 'BSF33.05',
                besst_serial_number: '',
            };
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
                this.emitter.emit('sensor-codes-data', { ...this._sensorCodes });
            }, 1500);
            console.log('Simulator: blank data loaded');
            return;
        }
        this.packetQueue.push(
            BafangCanSystem.generateBesstRequestPacket(
                BesstRequestType.BESST_HW,
                [0, 0, 0, 0],
            ),
        );
        this.packetQueue.push(
            BafangCanSystem.generateBesstRequestPacket(
                BesstRequestType.BESST_SW,
                [0, 0, 0, 0],
            ),
        );
        this.packetQueue.push(
            BafangCanSystem.generateBesstRequestPacket(
                BesstRequestType.BESST_SN,
                [0, 0, 0, 0],
            ),
        );
        const commandsToDisplay = [
            CanCommandsList.HardwareVersion,
            CanCommandsList.SoftwareVersion,
            CanCommandsList.ModelNumber,
            CanCommandsList.SerialNumber,
            CanCommandsList.CustomerNumber,
            CanCommandsList.Manufacturer,
            CanCommandsList.BootloaderVersion,
            CanCommandsList.DisplayDataBlock1,
            CanCommandsList.DisplayDataBlock2,
        ];
        commandsToDisplay.forEach((command) => {
            this.packetQueue.push(
                BafangCanSystem.generateBesstRequestPacket(
                    BesstRequestType.CAN_REQUEST,
                    BafangCanSystem.buildCanCommandSubpacket(
                        DeviceNetworkId.BESST,
                        DeviceNetworkId.DISPLAY,
                        CanOperation.READ_CMD,
                        command.canCommandCode,
                        command.canCommandSubCode,
                    ),
                ),
            );
        });
    }

    public saveData(): boolean {
        if (this.devicePath === 'simulator') {
            return true;
        }
        return false;
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
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    public cleanDisplayServiceMileage(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        this.packetQueue.push(
            BafangCanSystem.generateBesstRequestPacket(
                BesstRequestType.CAN_REQUEST,
                BafangCanSystem.buildCanCommandSubpacket(
                    DeviceNetworkId.BESST,
                    DeviceNetworkId.DISPLAY,
                    CanOperation.WRITE_CMD,
                    CanCommandsList.CleanServiceMileage.canCommandCode,
                    CanCommandsList.CleanServiceMileage.canCommandSubCode,
                ),
                [0x00, 0x00, 0x00, 0x00, 0x00],
            ),
        );
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    public get controllerCodes(): BafangCanControllerCodes {
        return { ...this._controllerCodes };
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

    public get displayState(): BafangCanDisplayState {
        return { ...this._displayState };
    }

    public get displayCodes(): BafangCanDisplayCodes {
        return { ...this._displayCodes };
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

    public set displayState(data: BafangCanDisplayState) {
        this._displayState = { ...data };
    }

    public set DisplayData(data: BafangCanDisplayData) {
        this._displayData = { ...data };
    }

    public set ControllerCodes(data: BafangCanControllerCodes) {
        this._controllerCodes = { ...data };
    }

    public set DisplayCodes(data: BafangCanDisplayCodes) {
        this._displayCodes = { ...data };
    }

    public set SensorCodes(data: BafangCanSensorCodes) {
        this._sensorCodes = { ...data };
    }

    public set BesstCodes(data: BafangBesstCodes) {
        this._besstCodes = { ...data };
    }
}
