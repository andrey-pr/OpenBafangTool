/* eslint-disable prefer-destructuring */
import EventEmitter from 'events';
import log from 'electron-log/renderer';
import { DeviceName } from '../../types/DeviceType';
import {
    AssistLevel,
    BafangUartMotorBasicParameters,
    BafangUartMotorInfo,
    BafangUartMotorPedalParameters,
    BafangUartMotorThrottleParameters,
    ParameterCodes,
    PedalType,
    SpeedLimitByDisplay,
    SpeedmeterType,
    ThrottleMode,
    Voltage,
    checkBasicParameters,
    checkInfo,
    checkPedalParameters,
    checkThrottleParameters,
} from '../../types/BafangUartMotorTypes';
import IConnection from './Connection';
import { closePort, openPort, writeToPort } from '../serial/serial-port';

const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

export default class BafangUartMotor implements IConnection {
    private port: string;

    private info: BafangUartMotorInfo;

    private basic_parameters: BafangUartMotorBasicParameters;

    private pedal_parameters: BafangUartMotorPedalParameters;

    private throttle_parameters: BafangUartMotorThrottleParameters;

    readonly deviceName: DeviceName = DeviceName.BafangUartMotor;

    public emitter: EventEmitter;

    private portBuffer: Uint8Array = new Uint8Array();

    constructor(port: string) {
        this.port = port;
        this.info = {
            serial_number: '',
            model: '',
            manufacturer: '',
            system_code: '',
            firmware_version: '',
            hardware_version: '',
            voltage: 48,
            max_current: 0,
        };
        this.basic_parameters = {
            low_battery_protection: 0,
            current_limit: 0,
            assist_profiles: [
                { current_limit: 0, speed_limit: 0 },
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
            magnets_per_wheel_rotation: 0,
            wheel_diameter: 0,
            speedmeter_type: SpeedmeterType.External,
        };
        this.pedal_parameters = {
            pedal_type: PedalType.None,
            pedal_assist_level: AssistLevel.AssistLevel0,
            pedal_speed_limit: 0,
            pedal_start_current: 0,
            pedal_slow_start_mode: 0,
            pedal_signals_before_start: 0,
            pedal_time_to_stop: 0,
            pedal_current_decay: 0,
            pedal_stop_decay: 0,
            pedal_keep_current: 0,
        };
        this.throttle_parameters = {
            throttle_start_voltage: 0,
            throttle_end_voltage: 0,
            throttle_mode: ThrottleMode.Speed,
            throttle_assist_level: AssistLevel.AssistLevel0,
            throttle_speed_limit: 0,
            throttle_start_current: 0,
        };
        this.emitter = new EventEmitter();
        this.loadData = this.loadData.bind(this);
    }

    private static prepareWritePackage(
        cmd: Uint8Array,
        data: Uint8Array,
    ): Uint8Array {
        let sum = 0;
        [cmd[1], data.length, ...data].forEach((byte) => {
            sum += byte;
        });
        sum &= 0xff;
        return new Uint8Array([...cmd, data.length, ...data, sum]);
    }

    private static stringToHex(str: string): Uint8Array {
        const result = [];
        for (let i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return new Uint8Array(result);
    }

    private processBuffer(): void {
        log.info(this.portBuffer);
        if (this.portBuffer.length <= 2) {
            return;
        }
        while (this.portBuffer.length > 0) {
            if (this.portBuffer.length >= 3) {
                if (
                    this.portBuffer[2] ===
                    ((this.portBuffer[0] + this.portBuffer[1]) & 0xff)
                ) {
                    log.info(
                        'Received short-format package: ',
                        this.portBuffer.slice(0, 3),
                    );
                    this.processWriteAnswerPacket(this.portBuffer.slice(0, 3));
                    this.portBuffer = this.portBuffer.slice(3);
                    continue;
                }
            }
            let sum = 0;
            this.portBuffer.slice(0, this.portBuffer[1] + 2).forEach((byte) => {
                sum += byte;
            });
            sum &= 0xff;
            if (sum === this.portBuffer[this.portBuffer[1] + 2]) {
                this.processPacket(
                    this.portBuffer.slice(0, this.portBuffer[1] + 3),
                );
                log.info(
                    'Received usual format package: ',
                    this.portBuffer.slice(0, this.portBuffer[1] + 3),
                );
                this.portBuffer = this.portBuffer.slice(this.portBuffer[1] + 3);
            } else {
                if (this.portBuffer.length < this.portBuffer[1] + 3) {
                    break;
                }

                log.info('Received thrash byte: ', this.portBuffer.slice(0, 1));
                this.portBuffer = this.portBuffer.slice(1);
            }
        }
    }

    private processWriteAnswerPacket(packet: Uint8Array): void {
        if (ParameterCodes[packet[0]] !== undefined) {
            if (ParameterCodes[packet[0]].parameters.length <= packet[1]) {
                this.emitter.emit(
                    'write-success',
                    `${ParameterCodes[packet[0]].name}`,
                );
            } else {
                this.emitter.emit(
                    'write-error',
                    `${ParameterCodes[packet[0]].parameters[packet[1]]}`,
                );
            }
        }
    }

    private processPacket(packet: Uint8Array): void {
        const data: Uint8Array = packet.slice(2, packet.length - 1);
        switch (packet[0]) {
            case 0x50:
                this.info.firmware_version = String.fromCharCode(...data);
                break;
            case 0x13:
                this.info.system_code = String.fromCharCode(...data);
                break;
            case 0x14:
                this.info.serial_number = String.fromCharCode(...data);
                break;
            case 0x16:
                // this.info.model = String.fromCharCode(...data);
                break;
            case 0x51:
                this.info.manufacturer = String.fromCharCode(
                    ...data.slice(0, 4),
                );
                this.info.model = String.fromCharCode(...data.slice(4, 8));
                this.info.hardware_version = `${String.fromCharCode(
                    data[8],
                )}.${String.fromCharCode(data[9])}`;
                this.info.voltage = Voltage[data[14]];
                this.info.max_current = data[15];
                break; // basic data
            case 0x52:
                this.basic_parameters.low_battery_protection = data[0];
                this.basic_parameters.current_limit = data[1];
                this.basic_parameters.assist_profiles = [];
                for (let i = 0; i < 10; i++) {
                    this.basic_parameters.assist_profiles.push({
                        current_limit: data[2 + i],
                        speed_limit: data[12 + i],
                    });
                }
                this.basic_parameters.wheel_diameter = data[22] / 2;
                this.basic_parameters.speedmeter_type =
                    (data[23] & 0b11000000) >> 6;
                this.basic_parameters.magnets_per_wheel_rotation =
                    data[23] & 0b111111;
                break; // basic parameters
            case 0x53:
                this.pedal_parameters.pedal_type = data[0];
                this.pedal_parameters.pedal_assist_level = data[1];
                this.pedal_parameters.pedal_speed_limit = data[2];
                this.pedal_parameters.pedal_start_current = data[3];
                this.pedal_parameters.pedal_slow_start_mode = data[4];
                this.pedal_parameters.pedal_signals_before_start = data[5];
                this.pedal_parameters.pedal_time_to_stop = data[7] * 10;
                this.pedal_parameters.pedal_current_decay = data[8];
                this.pedal_parameters.pedal_stop_decay = data[9] * 10;
                this.pedal_parameters.pedal_keep_current = data[10];
                break; // pedal parameters
            case 0x54:
                this.throttle_parameters.throttle_start_voltage = data[0] / 10;
                this.throttle_parameters.throttle_end_voltage = data[1] / 10;
                this.throttle_parameters.throttle_mode = data[2];
                this.throttle_parameters.throttle_assist_level = data[3];
                this.throttle_parameters.throttle_speed_limit = data[4];
                this.throttle_parameters.throttle_start_current = data[5];
                break;
            default:
                break;
        }
        this.emitter.emit('data');
        this.emitter.emit('read-finish', 7, 0);
    }

    connect(): Promise<boolean> {
        if (this.port === 'demo') {
            console.log('Demo mode: connected');
            return new Promise<boolean>((resolve) => {
                resolve(true);
            });
        }
        let ready: boolean = false;
        let success: boolean = false;
        openPort(
            this.port,
            1200,
            () => {
                success = true;
                ready = true;
            },
            (err: Error | null) => {
                if (!err) return;
                console.log('Serial port error ', err);
                success = false;
                ready = true;
            },
            (responsePath: string, data: Uint8Array) => {
                if (responsePath === this.port) {
                    this.portBuffer = new Uint8Array([
                        ...Array.from(this.portBuffer),
                        ...Array.from(data),
                    ]);
                    this.processBuffer();
                }
            },
        );
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<boolean>(async (resolve) => {
            let counter: number = 0;
            while (!ready && counter++ < 1000) {
                // eslint-disable-next-line no-await-in-loop
                await sleep(1);
            }
            resolve(success);
        });
    }

    disconnect(): void {
        if (this.port === 'demo') {
            console.log('Demo mode: disconnected');
            return;
        }
        closePort(this.port);
    }

    testConnection(): Promise<boolean> {
        if (this.port === 'demo') {
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
        if (this.port === 'demo') {
            this.info = {
                serial_number: '201608080001',
                model: 'SW06',
                manufacturer: 'SZBF',
                system_code: 'MAX01_V2.2_DS',
                firmware_version: 'CRX10B4812E010026.3',
                hardware_version: '2.2',
                voltage: 48,
                max_current: 12,
            };
            this.basic_parameters = {
                low_battery_protection: 41,
                current_limit: 12,
                assist_profiles: [
                    { current_limit: 0, speed_limit: 100 },
                    { current_limit: 23, speed_limit: 100 },
                    { current_limit: 15, speed_limit: 100 },
                    { current_limit: 39, speed_limit: 100 },
                    { current_limit: 30, speed_limit: 100 },
                    { current_limit: 51, speed_limit: 100 },
                    { current_limit: 45, speed_limit: 100 },
                    { current_limit: 64, speed_limit: 100 },
                    { current_limit: 66, speed_limit: 100 },
                    { current_limit: 100, speed_limit: 100 },
                ],
                wheel_diameter: 28,
                magnets_per_wheel_rotation: 1,
                speedmeter_type: SpeedmeterType.External,
            };
            this.pedal_parameters = {
                pedal_type: PedalType.BBSensor32,
                pedal_assist_level: AssistLevel.ByDisplay,
                pedal_speed_limit: SpeedLimitByDisplay,
                pedal_start_current: 30,
                pedal_slow_start_mode: 5,
                pedal_signals_before_start: 4,
                pedal_time_to_stop: 250,
                pedal_current_decay: 4,
                pedal_stop_decay: 0,
                pedal_keep_current: 30,
            };
            this.throttle_parameters = {
                throttle_start_voltage: 3.5,
                throttle_end_voltage: 3.5,
                throttle_mode: ThrottleMode.Current,
                throttle_assist_level: AssistLevel.ByDisplay,
                throttle_speed_limit: 32,
                throttle_start_current: 10,
            };
            setTimeout(() => {
                this.emitter.emit('data');
                this.emitter.emit('read-finish', 7, 0);
            }, 300);
            console.log('Demo mode: blank data loaded');
            return;
        }
        const request = [
            [0x11, 0x51, 0x04, 0xb0, 0x05],
            [0x11, 0x52],
            [0x11, 0x52],
            [0x11, 0x53],
            [0x11, 0x54],
            [0x11, 0x50],
            [0x14, 0x13],
            [0x14, 0x14],
            [0x14, 0x16],
        ];
        const port = this.port;
        function sendRequest(i: number): void {
            log.info('Sent read package: ', request[i]);
            writeToPort(port, Buffer.from(request[i])).then();
            if (i !== request.length - 1) {
                setTimeout(sendRequest, 300, i + 1);
            }
        }
        sendRequest(0);
    }

    saveData(): boolean {
        if (
            !checkInfo(this.info) ||
            !checkBasicParameters(this.basic_parameters) ||
            !checkPedalParameters(this.pedal_parameters) ||
            !checkThrottleParameters(this.throttle_parameters)
        ) {
            return false;
        }
        if (this.port === 'demo') {
            setTimeout(() => this.emitter.emit('write-success', 'basic'), 300);
            setTimeout(() => this.emitter.emit('write-success', 'pedal'), 600);
            setTimeout(
                () => this.emitter.emit('write-success', 'throttle'),
                900,
            );
            console.log('Demo mode: data saved');
            console.log(this.info);
            console.log(this.basic_parameters);
            console.log(this.pedal_parameters);
            console.log(this.throttle_parameters);
            return true;
        }
        const basicParametersPacket: Uint8Array = new Uint8Array([
            this.basic_parameters.low_battery_protection,
            this.basic_parameters.current_limit,
            this.basic_parameters.assist_profiles[0].current_limit,
            this.basic_parameters.assist_profiles[1].current_limit,
            this.basic_parameters.assist_profiles[2].current_limit,
            this.basic_parameters.assist_profiles[3].current_limit,
            this.basic_parameters.assist_profiles[4].current_limit,
            this.basic_parameters.assist_profiles[5].current_limit,
            this.basic_parameters.assist_profiles[6].current_limit,
            this.basic_parameters.assist_profiles[7].current_limit,
            this.basic_parameters.assist_profiles[8].current_limit,
            this.basic_parameters.assist_profiles[9].current_limit,
            this.basic_parameters.assist_profiles[0].speed_limit,
            this.basic_parameters.assist_profiles[1].speed_limit,
            this.basic_parameters.assist_profiles[2].speed_limit,
            this.basic_parameters.assist_profiles[3].speed_limit,
            this.basic_parameters.assist_profiles[4].speed_limit,
            this.basic_parameters.assist_profiles[5].speed_limit,
            this.basic_parameters.assist_profiles[6].speed_limit,
            this.basic_parameters.assist_profiles[7].speed_limit,
            this.basic_parameters.assist_profiles[8].speed_limit,
            this.basic_parameters.assist_profiles[9].speed_limit,
            this.basic_parameters.wheel_diameter * 2,
            ((this.basic_parameters.speedmeter_type & 0b11) << 6) +
                (this.basic_parameters.magnets_per_wheel_rotation & 0b111111),
        ]);
        const workMode = 10;
        const pedalParametersPacket: Uint8Array = new Uint8Array([
            this.pedal_parameters.pedal_type,
            this.pedal_parameters.pedal_assist_level,
            this.pedal_parameters.pedal_speed_limit,
            this.pedal_parameters.pedal_start_current,
            this.pedal_parameters.pedal_slow_start_mode,
            this.pedal_parameters.pedal_signals_before_start,
            workMode,
            this.pedal_parameters.pedal_time_to_stop / 10,
            this.pedal_parameters.pedal_current_decay,
            this.pedal_parameters.pedal_stop_decay / 10,
            this.pedal_parameters.pedal_keep_current,
        ]);
        const throttleParametersPacket: Uint8Array = new Uint8Array([
            this.throttle_parameters.throttle_start_voltage * 10,
            this.throttle_parameters.throttle_end_voltage * 10,
            this.throttle_parameters.throttle_mode,
            this.throttle_parameters.throttle_assist_level,
            this.throttle_parameters.throttle_speed_limit,
            this.throttle_parameters.throttle_start_current,
        ]);
        const request = [
            BafangUartMotor.prepareWritePackage(
                new Uint8Array([0x17, 0x01]),
                BafangUartMotor.stringToHex(this.info.serial_number),
            ),
            BafangUartMotor.prepareWritePackage(
                new Uint8Array([0x16, 0x52]),
                basicParametersPacket,
            ),
            BafangUartMotor.prepareWritePackage(
                new Uint8Array([0x16, 0x53]),
                pedalParametersPacket,
            ),
            BafangUartMotor.prepareWritePackage(
                new Uint8Array([0x16, 0x54]),
                throttleParametersPacket,
            ),
        ];
        const port = this.port;
        function sendRequest(i: number): void {
            log.info('Sent write package: ', request[i]);
            writeToPort(port, Buffer.from(request[i])).then();
            if (i !== request.length - 1) {
                setTimeout(sendRequest, 300, i + 1);
            }
        }
        sendRequest(0);
        return true;
    }

    getInfo(): BafangUartMotorInfo {
        return JSON.parse(JSON.stringify(this.info)); // method of object clonning, that is stupid but works
    }

    getBasicParameters(): BafangUartMotorBasicParameters {
        console.log(this.basic_parameters);
        return JSON.parse(JSON.stringify(this.basic_parameters)); // method of object clonning, that is stupid but works
    }

    getPedalParameters(): BafangUartMotorPedalParameters {
        return JSON.parse(JSON.stringify(this.pedal_parameters)); // method of object clonning, that is stupid but works
    }

    getThrottleParameters(): BafangUartMotorThrottleParameters {
        return JSON.parse(JSON.stringify(this.throttle_parameters)); // method of object clonning, that is stupid but works
    }

    setBasicParameters(data: BafangUartMotorBasicParameters): void {
        this.basic_parameters = JSON.parse(JSON.stringify(data));
    }

    setPedalParameters(data: BafangUartMotorPedalParameters): void {
        this.pedal_parameters = JSON.parse(JSON.stringify(data));
    }

    setThrottleParameters(data: BafangUartMotorThrottleParameters): void {
        this.throttle_parameters = JSON.parse(JSON.stringify(data));
    }

    setSerialNumber(sn: string): void {
        if (this.info) {
            this.info.serial_number = sn;
        }
    }
}
