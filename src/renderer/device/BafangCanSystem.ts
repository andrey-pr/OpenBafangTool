/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import { DeviceName } from '../models/DeviceType';
import IConnection from './Connection';
import {
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

export default class BafangCanSystem implements IConnection {
    private port: string;

    readonly deviceName: DeviceName = DeviceName.BafangCanSystem;

    public emitter: EventEmitter;

    private unsubscribe: (() => void) | undefined = undefined;

    private portBuffer: Uint8Array = new Uint8Array();

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

    constructor(port: string) {
        this.port = port;
        this.emitter = new EventEmitter();
        this.controllerRealtimeData = {
            controller_cadence: 0,
            controller_torque: 0,
            controller_speed: 0,
            controller_current: 0,
            controller_voltage: 0,
            controller_temperature: 0,
            controller_motor_temperature: 0,
            controller_walk_assistance: false,
            controller_calories: 0,
            controller_remaining_capacity: 0,
            controller_single_trip: 0,
            controller_remaining_distance: 0,
        };
        this.sensorRealtimeData = {
            sensor_torque: 0,
            sensor_cadence: 0,
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
            display_total_mileage: 0,
            display_single_mileage: 0,
            display_max_speed: 0,
            display_average_speed: 0,
            display_service_mileage: 0,
            display_last_shutdown_time: 0,
        };
        this.displayState = {
            display_assist_levels: 0,
            display_ride_mode: BafangCanRideMode.ECO,
            display_boost: false,
            display_current_assist_level: 0,
            display_light: false,
            display_button: false,
        };
        this.controllerCodes = {
            controller_hardware_version: '',
            controller_software_version: '',
            controller_model_number: '',
            controller_serial_number: '',
            controller_customer_number: '',
            controller_manufacturer: '',
            controller_bootload_version: '',
        };
        this.displayCodes = {
            display_hardware_version: '',
            display_software_version: '',
            display_model_number: '',
            display_serial_number: '',
            display_customer_number: '',
            display_manufacturer: '',
            display_bootload_version: '',
        };
        this.sensorCodes = {
            sensor_hardware_version: '',
            sensor_software_version: '',
            sensor_model_number: '',
            sensor_serial_number: '',
            sensor_customer_number: '',
            sensor_manufacturer: '',
            sensor_bootload_version: '',
        };
        this.loadData = this.loadData.bind(this);
        this.simulationDataPublisher = this.simulationDataPublisher.bind(this);
        this.simulationRealtimeDataGenerator =
            this.simulationRealtimeDataGenerator.bind(this);
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
                this.displayState.display_current_assist_level == 'walk'
                    ? 5
                    : 'walk',
            display_light: !this.displayState.display_light,
            display_button: !this.displayState.display_button,
        };
    }

    connect(): Promise<boolean> {
        if (this.port === 'simulator') {
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
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    disconnect(): void {
        if (this.port === 'simulator') {
            console.log('Simulator disconnected');
            clearInterval(this.simulationDataPublisherInterval);
            clearInterval(this.simulationRealtimeDataGeneratorInterval);
        }
        if (this.unsubscribe !== undefined) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
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
        if (this.port === 'simulator') {
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
        if (this.port === 'simulator') {
            console.log('Cleaned display mileage');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        return new Promise<boolean>((resolve) => {
            resolve(false);
        });
    }

    testConnection(): Promise<boolean> {
        if (this.port === 'simulator') {
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

    getControllerCodes(): BafangCanControllerCodes {
        return JSON.parse(JSON.stringify(this.controllerCodes)); // method of object clonning, that is stupid but works
    }

    getControllerParameters1(): BafangCanControllerParameters1 {
        return JSON.parse(JSON.stringify(this.controllerParameters1)); // method of object clonning, that is stupid but works
    }

    getDisplayData(): BafangCanDisplayData {
        return JSON.parse(JSON.stringify(this.displayData)); // method of object clonning, that is stupid but works
    }

    getDisplayState(): BafangCanDisplayState {
        return JSON.parse(JSON.stringify(this.displayState)); // method of object clonning, that is stupid but works
    }

    getDisplayCodes(): BafangCanDisplayCodes {
        return JSON.parse(JSON.stringify(this.displayCodes)); // method of object clonning, that is stupid but works
    }

    getSensorCodes(): BafangCanSensorCodes {
        return JSON.parse(JSON.stringify(this.sensorCodes)); // method of object clonning, that is stupid but works
    }

    setControllerParameters1(data: BafangCanControllerParameters1): void {
        this.controllerParameters1 = JSON.parse(JSON.stringify(data));
    }

    setDisplayState(data: BafangCanDisplayState): void {
        this.displayState = JSON.parse(JSON.stringify(data));
    }

    setDisplayData(data: BafangCanDisplayData): void {
        this.displayData = JSON.parse(JSON.stringify(data));
    }

    setControllerCodes(data: BafangCanControllerCodes): void {
        this.controllerCodes = JSON.parse(JSON.stringify(data));
    }

    setDisplayCodes(data: BafangCanDisplayCodes): void {
        this.displayCodes = JSON.parse(JSON.stringify(data));
    }

    setSensorCodes(data: BafangCanSensorCodes): void {
        this.sensorCodes = JSON.parse(JSON.stringify(data));
    }

    loadData(): void {
        if (this.port === 'simulator') {
            //TODO fill DTOs with realistic data
            this.controllerRealtimeData = {
                controller_cadence: 1,
                controller_torque: 1,
                controller_speed: 1,
                controller_current: 1,
                controller_voltage: 1,
                controller_temperature: 1,
                controller_motor_temperature: 1,
                controller_walk_assistance: false,
                controller_calories: 1,
                controller_remaining_capacity: 1,
                controller_single_trip: 1,
                controller_remaining_distance: 1,
            };
            this.sensorRealtimeData = {
                sensor_torque: 1,
                sensor_cadence: 1,
            };
            this.controllerParameters1 = {
                controller_system_voltage: 36,
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
                display_current_assist_level: 'walk',
                display_light: false,
                display_button: false,
            };
            this.controllerCodes = {
                controller_hardware_version: '1',
                controller_software_version: '1',
                controller_model_number: '1',
                controller_serial_number: '1',
                controller_customer_number: '1',
                controller_manufacturer: '1',
                controller_bootload_version: '1',
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
                sensor_hardware_version: '1',
                sensor_software_version: '1',
                sensor_model_number: '1',
                sensor_serial_number: '1',
                sensor_customer_number: '1',
                sensor_manufacturer: '1',
                sensor_bootload_version: '1',
            };
            setTimeout(() => this.emitter.emit('data'), 1500);
            console.log('Simulator: blank data loaded');
        }
    }

    saveData(): boolean {
        if (this.port === 'simulator') {
            return true;
        }
        return false;
    }
}
