/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { DeviceName } from '../models/DeviceType';
import IConnection from './Connection';
import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerParameters1,
    BafangCanControllerRealtime,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanMotorType,
    BafangCanPedalSensorType,
    BafangCanRideMode,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
    BafangCanTemperatureSensorType,
} from './BafangCanSystemTypes';
import HID from 'node-hid';
import { NotAvailable, NotLoadedYet } from '../types/no_data';

enum PacketType {
    CAN = 0x15,
    BESST_HW = 0x30,
    BESST_SN = 0x31,
    BESST_SW = 0x32,
    BESST_RESET = 0x39,
}

type BesstRequestPacket = {
    data: number[];
    interval: number;
    type: PacketType;
};

export default class BafangCanSystem implements IConnection {
    private devicePath: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    private device: HID.HID | null = null;

    public emitter: EventEmitter;

    private simulationDataPublisherInterval: NodeJS.Timeout | undefined;

    private simulationRealtimeDataGeneratorInterval: NodeJS.Timeout | undefined;

    private controllerRealtimeData: BafangCanControllerRealtime;

    private sensorRealtimeData: BafangCanSensorRealtime;

    private controllerParameters1: BafangCanControllerParameters1;

    private displayData: BafangCanDisplayData;

    private displayState: BafangCanDisplayState;

    private controllerCodes: BafangCanControllerCodes;

    private displayCodes: BafangCanDisplayCodes;

    private sensorCodes: BafangCanSensorCodes;

    private besstCodes: BafangBesstCodes;

    private packetQueue: BesstRequestPacket[] = [];

    private lastWrittenPacket: BesstRequestPacket | undefined;

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
        this.controllerParameters1 = {
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
        this.displayData = {
            display_total_mileage: NotLoadedYet,
            display_single_mileage: NotLoadedYet,
            display_max_speed: NotLoadedYet,
            display_average_speed: NotLoadedYet,
            display_service_mileage: NotLoadedYet,
            display_last_shutdown_time: NotLoadedYet,
        };
        this.displayState = {
            display_assist_levels: NotLoadedYet,
            display_ride_mode: NotLoadedYet,
            display_boost: NotLoadedYet,
            display_current_assist_level: NotLoadedYet,
            display_light: NotLoadedYet,
            display_button: NotLoadedYet,
        };
        this.controllerCodes = {
            controller_hardware_version: NotLoadedYet,
            controller_software_version: NotLoadedYet,
            controller_model_number: NotLoadedYet,
            controller_serial_number: NotLoadedYet,
            controller_customer_number: NotLoadedYet,
            controller_manufacturer: NotLoadedYet,
            controller_bootload_version: NotLoadedYet,
        };
        this.displayCodes = {
            display_hardware_version: NotLoadedYet,
            display_software_version: NotLoadedYet,
            display_model_number: NotLoadedYet,
            display_serial_number: NotLoadedYet,
            display_customer_number: NotLoadedYet,
            display_manufacturer: NotLoadedYet,
            display_bootload_version: NotLoadedYet,
        };
        this.sensorCodes = {
            sensor_hardware_version: NotLoadedYet,
            sensor_software_version: NotLoadedYet,
            sensor_model_number: NotLoadedYet,
            sensor_serial_number: NotLoadedYet,
            sensor_customer_number: NotLoadedYet,
            sensor_manufacturer: NotLoadedYet,
            sensor_bootload_version: NotLoadedYet,
        };
        this.besstCodes = {
            besst_hardware_version: NotLoadedYet,
            besst_software_version: NotLoadedYet,
            besst_serial_number: NotLoadedYet,
        };
        this.loadData = this.loadData.bind(this);
        this.simulationDataPublisher = this.simulationDataPublisher.bind(this);
        this.simulationRealtimeDataGenerator =
            this.simulationRealtimeDataGenerator.bind(this);
        this.processRequestQueue = this.processRequestQueue.bind(this);
        this.processResponseBesstPacket =
            this.processResponseBesstPacket.bind(this);
        this.processResponsePacket = this.processResponsePacket.bind(this);
    }

    private simulationDataPublisher(): void {
        this.sensorRealtimeData.sensor_torque++;
        this.emitter.emit('broadcast-data-controller', {
            ...this.controllerRealtimeData,
        });
        this.emitter.emit('broadcast-data-display', {
            ...this.displayState,
        });
        this.emitter.emit('broadcast-data-sensor', {
            ...this.sensorRealtimeData,
        });
    }

    private simulationRealtimeDataGenerator(): void {
        this.displayState = {
            display_assist_levels: 5,
            display_ride_mode: BafangCanRideMode.ECO,
            display_boost: false,
            display_current_assist_level:
                this.displayState.display_current_assist_level === 'walk'
                    ? 5
                    : 'walk',
            display_light: !this.displayState.display_light,
            display_button: !this.displayState.display_button,
        };
    }

    public static filterHidDevices(devices: HID.Device[]): HID.Device[] {
        return devices.filter((device) => device.product === 'BaFang Besst');
    }

    private static generateRequest(
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
            case PacketType.BESST_HW:
            case PacketType.BESST_SW:
            case PacketType.BESST_SN:
                interval = 150;
                break;
            case PacketType.CAN:
                interval = 300;
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

    private static hexMsgDecoder(msg: number[]) {
        return msg
            .slice(4, 4 + msg[3])
            .filter((value) => value != 0)
            .map((e) => String.fromCharCode(e))
            .join('');
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
        this.lastWrittenPacket = packet;
        this.packetQueueBlockTime = Date.now() + packet.interval;
        setTimeout(this.processRequestQueue, packet.interval + 10);
    }

    private processResponsePacket(data: Uint8Array): void {
        if (data.length === 0) return;
        let array: number[] = [...data];
        console.log('New data from device ', array);
        switch (array[0]) {
            case 0x10:
            case 0x11:
                console.log('UART bike connected - its not supported');
                break;
            case 0x12:
                this.processResponseCanPacket(array);
                break;
            case 0x30:
            case 0x31:
            case 0x32:
            case 0x39:
                this.processResponseBesstPacket(array);
                break;
            case 0x28:
                console.log('Firmware update - not supported yet');
                break;
            default:
                console.log('Unknown message type - not supperted yet');
                break;
        }
    }

    private processResponseCanPacket(data: number[]): void {}

    private processResponseBesstPacket(data: number[]): void {
        if (
            Date.now() > this.packetQueueBlockTime ||
            this.lastWrittenPacket === undefined ||
            (this.lastWrittenPacket.type !== PacketType.BESST_HW &&
                this.lastWrittenPacket.type !== PacketType.BESST_SW &&
                this.lastWrittenPacket.type !== PacketType.BESST_SN)
        )
            return;
        switch (this.lastWrittenPacket.type) {
            case PacketType.BESST_HW:
                this.besstCodes.besst_hardware_version =
                    BafangCanSystem.hexMsgDecoder(data);
                break;
            case PacketType.BESST_SW:
                this.besstCodes.besst_software_version =
                    BafangCanSystem.hexMsgDecoder(data);
                break;
            case PacketType.BESST_SN:
                this.besstCodes.besst_serial_number =
                    BafangCanSystem.hexMsgDecoder(data);
                break;
        }
        this.emitter.emit('besst-data', { ...this.besstCodes });
    }

    connect(): Promise<boolean> {
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
        this.device.addListener('data', this.processResponsePacket);
        setTimeout(this.processRequestQueue, 100);
        return new Promise<boolean>((resolve) => {
            resolve(true);
        });
    }

    disconnect(): void {
        if (this.devicePath === 'simulator') {
            console.log('Simulator disconnected');
            clearInterval(this.simulationDataPublisherInterval);
            clearInterval(this.simulationRealtimeDataGeneratorInterval);
            return;
        }
    }

    testConnection(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        return this.connect()
            .then((value) => {
                // TODO add test package send
                this.disconnect();
                return value;
            })
            .catch(() => {
                return false;
            });
    }

    loadData(): void {
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
            this.controllerParameters1 = {
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
            this.displayData = {
                display_total_mileage: 10000,
                display_single_mileage: 1000,
                display_max_speed: 0,
                display_average_speed: 0,
                display_service_mileage: 0,
                display_last_shutdown_time: 5,
            };
            this.displayState = {
                display_assist_levels: 5,
                display_ride_mode: BafangCanRideMode.ECO,
                display_boost: false,
                display_current_assist_level: 0,
                display_light: false,
                display_button: false,
            };
            this.controllerCodes = {
                controller_hardware_version: 'CR X10V.350.FC 2.1',
                controller_software_version: 'CRX10VC3615E101004.0',
                controller_model_number: 'CR X10V.350.FC',
                controller_serial_number: 'CRX10V.350.FC2.1A42F5TB045999',
                controller_customer_number: '', //TODO
                controller_manufacturer: 'BAFANG',
                controller_bootload_version: '1', //TODO
            };
            this.displayCodes = {
                display_hardware_version: 'DP C221.C 2.0',
                display_software_version: 'DPC221CE10205.1',
                display_model_number: 'DP C221.CAN',
                display_serial_number: 'DPC221.C2.0702F8WC080505',
                display_customer_number: '0049-0074',
                display_manufacturer: 'BAFANG',
                display_bootload_version: 'APM32.DPCAN.V3.0.1',
            };
            this.sensorCodes = {
                sensor_hardware_version: 'SR PA212.32.ST.C 1.0',
                sensor_software_version: 'SRPA212CF10101.0',
                sensor_model_number: 'SR PA212.32.ST.C',
                sensor_serial_number: '0000000000',
                sensor_customer_number: '1', //TODO
                sensor_manufacturer: '1', //TODO
                sensor_bootload_version: '1', //TODO
            };
            this.besstCodes = {
                besst_hardware_version: 'BESST.UC 3.0.3',
                besst_software_version: 'BSF33.05',
                besst_serial_number: '',
            };
            setTimeout(() => {
                this.emitter.emit('data');
                this.emitter.emit('controller-data', {
                    ...this.controllerCodes,
                });
                this.emitter.emit('display-general-data', {
                    ...this.displayData,
                });
                this.emitter.emit('display-state-data', {
                    ...this.displayState,
                });
                this.emitter.emit('display-codes-data', {
                    ...this.displayCodes,
                });
                this.emitter.emit('sensor-data', { ...this.sensorCodes });
            }, 1500);
            console.log('Simulator: blank data loaded');
            return;
        }
        this.packetQueue.push(
            BafangCanSystem.generateRequest(PacketType.BESST_HW, [0, 0, 0, 0]),
        );
        this.packetQueue.push(
            BafangCanSystem.generateRequest(PacketType.BESST_SW, [0, 0, 0, 0]),
        );
        this.packetQueue.push(
            BafangCanSystem.generateRequest(PacketType.BESST_SN, [0, 0, 0, 0]),
        );
    }

    saveData(): boolean {
        if (this.devicePath === 'simulator') {
            return true;
        }
        return false;
    }

    setDisplayTime(
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

    cleanDisplayServiceMileage(): Promise<boolean> {
        if (this.devicePath === 'simulator') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    getControllerCodes(): BafangCanControllerCodes {
        return { ...this.controllerCodes }; // method of object clonning, that is stupid but works
    }

    getControllerParameters1(): BafangCanControllerParameters1 {
        return {...this.controllerParameters1}; // method of object clonning, that is stupid but works
    }

    getDisplayData(): BafangCanDisplayData {
        return {...this.displayData}; // method of object clonning, that is stupid but works
    }

    getDisplayState(): BafangCanDisplayState {
        return {...this.displayState}; // method of object clonning, that is stupid but works
    }

    getDisplayCodes(): BafangCanDisplayCodes {
        return {...this.displayCodes}; // method of object clonning, that is stupid but works
    }

    getSensorCodes(): BafangCanSensorCodes {
        return {...this.sensorCodes}; // method of object clonning, that is stupid but works
    }

    getBesstCodes(): BafangBesstCodes {
        return {...this.besstCodes}; // method of object clonning, that is stupid but works
    }

    setControllerParameters1(data: BafangCanControllerParameters1): void {
        this.controllerParameters1 = {...data};
    }

    setDisplayState(data: BafangCanDisplayState): void {
        this.displayState = {...data};
    }

    setDisplayData(data: BafangCanDisplayData): void {
        this.displayData = {...data};
    }

    setControllerCodes(data: BafangCanControllerCodes): void {
        this.controllerCodes = {...data};
    }

    setDisplayCodes(data: BafangCanDisplayCodes): void {
        this.displayCodes = {...data};
    }

    setSensorCodes(data: BafangCanSensorCodes): void {
        this.sensorCodes = {...data};
    }

    setBesstCodes(data: BafangBesstCodes): void {
        this.besstCodes = {...data};
    }
}
