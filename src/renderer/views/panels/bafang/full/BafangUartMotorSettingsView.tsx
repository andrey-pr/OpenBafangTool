import React from 'react';
import {
    Typography,
    Descriptions,
    Table,
    Select,
    FloatButton,
    message,
    Switch,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, RocketOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../../../device/BafangUartMotor';
import {
    AssistLevel,
    BafangUartMotorBasicParameters,
    BafangUartMotorInfo,
    BafangUartMotorPedalParameters,
    BafangUartMotorThrottleParameters,
    ParameterNames,
    PedalType,
    SpeedLimitByDisplay,
    SpeedmeterType,
    ThrottleMode,
} from '../../../../device/BafangUartMotorTypes';
import { lowVoltageLimits } from '../../../../constants/parameter_limits';
import ParameterInputComponent from '../../../components/ParameterInput';
import StringInputComponent from '../../../components/StringInput';

const { Title } = Typography;

const { Column } = Table;

type AssistTableRow = {
    key: React.Key;
    assist_level: number;
    current: number;
    speed: number;
    tip: string;
    recommended_min: number;
    recommended_max: number;
};

type SettingsProps = {
    connection: BafangUartMotor;
};

type SettingsState = BafangUartMotorInfo &
    BafangUartMotorBasicParameters &
    BafangUartMotorPedalParameters &
    BafangUartMotorThrottleParameters & {
        pedal_speed_limit_unit: string;
        throttle_speed_limit_unit: string;
        lastUpdateTime: number;
        oldStyle: boolean;
    };

/* eslint-disable camelcase */
class BafangUartMotorSettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    private initial_info: BafangUartMotorInfo;

    private initial_basic_parameters: BafangUartMotorBasicParameters;

    private initial_pedal_parameters: BafangUartMotorPedalParameters;

    private initial_throttle_parameters: BafangUartMotorThrottleParameters;

    private packages_written: number;

    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.initial_info = connection.getInfo();
        this.initial_basic_parameters = connection.getBasicParameters();
        this.initial_pedal_parameters = connection.getPedalParameters();
        this.initial_throttle_parameters = connection.getThrottleParameters();
        this.packages_written = 0;
        this.state = {
            ...this.initial_info,
            ...this.initial_basic_parameters,
            ...this.initial_pedal_parameters,
            ...this.initial_throttle_parameters,
            pedal_speed_limit_unit:
                this.initial_pedal_parameters.pedal_speed_limit ===
                SpeedLimitByDisplay
                    ? 'by_display'
                    : 'kmh',
            throttle_speed_limit_unit:
                this.initial_throttle_parameters.throttle_speed_limit ===
                SpeedLimitByDisplay
                    ? 'by_display'
                    : 'kmh',
            lastUpdateTime: 0,
            oldStyle: false,
        };
        this.getElectricalParameterItems =
            this.getElectricalParameterItems.bind(this);
        this.getPhysicalParameterItems =
            this.getPhysicalParameterItems.bind(this);
        this.getDriveParameterItems = this.getDriveParameterItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.getAssistLevelTableData = this.getAssistLevelTableData.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        this.onWriteSuccess = this.onWriteSuccess.bind(this);
        this.onWriteError = this.onWriteError.bind(this);
        connection.emitter.removeAllListeners('write-success');
        connection.emitter.removeAllListeners('write-error');
        connection.emitter.on('data', this.updateData);
        connection.emitter.on('write-success', this.onWriteSuccess);
        connection.emitter.on('write-error', this.onWriteError);
    }

    onWriteSuccess(pkg_code: string): void {
        // eslint-disable-next-line react/destructuring-assignment, react/no-access-state-in-setstate
        this.packages_written++;
        message.success(`${ParameterNames[pkg_code]} written successfull`);
    }

    onWriteError(parameter_code: string): void {
        message.error(`${ParameterNames[parameter_code]} write error`);
    }

    getElectricalParameterItems(): DescriptionsProps['items'] {
        const {
            voltage,
            low_battery_protection,
            max_current,
            current_limit,
            pedal_start_current,
            throttle_start_voltage,
            throttle_end_voltage,
            throttle_start_current,
        } = this.state;
        return [
            {
                key: 'low_voltage_protection',
                label: 'Low voltage battery protection',
                children: (
                    <ParameterInputComponent
                        value={low_battery_protection}
                        unit="V"
                        min={0}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                low_battery_protection: e,
                            });
                        }}
                        warningText={`Its not recommended to set low voltage battery protection lower than ${lowVoltageLimits[voltage].min}V and higher that ${lowVoltageLimits[voltage].max}V on your system`}
                        warningBelow={lowVoltageLimits[voltage].min}
                        warningAbove={lowVoltageLimits[voltage].max}
                    />
                ),
            },
            {
                key: 'current_limit',
                label: 'Current limit',
                children: (
                    <ParameterInputComponent
                        value={current_limit}
                        unit="A"
                        min={1}
                        max={max_current}
                        onNewValue={(e) => {
                            this.setState({
                                current_limit: e,
                            });
                        }}
                        warningText={`Its not recommended to set current limit lower than 1A and higher that ${max_current}A on your system`}
                        warningBelow={1}
                        warningAbove={max_current}
                    />
                ),
            },
            {
                key: 'pedal_start_current',
                label: 'Pedal start current',
                children: (
                    <ParameterInputComponent
                        value={pedal_start_current}
                        unit="%"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_start_current: e,
                            });
                        }}
                        warningText="Its not recommended to set high pedal start current"
                        warningBelow={1}
                        warningAbove={30}
                    />
                ),
            },
            {
                key: 'throttle_start_voltage',
                label: 'Throttle start voltage',
                children: (
                    <ParameterInputComponent
                        value={throttle_start_voltage}
                        unit="V"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_start_voltage: e,
                            });
                        }}
                        warningText="Its not recommended to set lower start voltage than 1.1V"
                        warningBelow={1.1}
                        decimalPlaces={1}
                    />
                ),
            },
            {
                key: 'throttle_end_voltage',
                label: 'Throttle end voltage',
                children: (
                    <ParameterInputComponent
                        value={throttle_end_voltage}
                        unit="V"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_end_voltage: e,
                            });
                        }}
                        warningText="Its not recommended to set lower end voltage than 1.1V"
                        warningBelow={1.1}
                        decimalPlaces={1}
                    />
                ),
            },
            {
                key: 'throttle_start_current',
                label: 'Throttle start current',
                children: (
                    <ParameterInputComponent
                        value={throttle_start_current}
                        unit="%"
                        min={0}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_start_current: e,
                            });
                        }}
                        warningText="Its not recommended to set lower start current than 10% and higher than 20%"
                        warningBelow={10}
                        warningAbove={20}
                    />
                ),
            },
        ];
    }

    getPhysicalParameterItems(): DescriptionsProps['items'] {
        const { wheel_diameter, speedmeter_type, pedal_type } = this.state;
        return [
            {
                key: 'wheel_diameter',
                label: 'Wheel diameter',
                children: (
                    <ParameterInputComponent
                        value={wheel_diameter}
                        unit="″"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                wheel_diameter: e,
                            });
                        }}
                        warningText="Usually bike wheels has size in range from 12 to 29 inches"
                        warningBelow={12}
                        warningAbove={29}
                    />
                ),
            },
            {
                key: 'speedmeter_type',
                label: 'Speedmeter type',
                children: (
                    // <Tooltip
                    //     title="Are you sure that you installed different type of speed sensor?"
                    //     trigger="click"
                    //     defaultOpen
                    // >
                    <Select
                        value={speedmeter_type}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: SpeedmeterType.External,
                                label: 'External',
                            },
                            {
                                value: SpeedmeterType.Internal,
                                label: 'Internal',
                            },
                            {
                                value: SpeedmeterType.Motorphase,
                                label: 'Motorphase',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ speedmeter_type: e });
                            }
                        }}
                        // status="warning"
                    />
                    // </Tooltip>
                ),
            },
            {
                key: 'pedal_sensor_type',
                label: 'Pedal sensor type',
                children: (
                    // <Tooltip
                    //     title="Are you sure that you installed different type of pedal sensor?"
                    //     trigger="click"
                    //     defaultOpen
                    // >
                    <Select
                        value={pedal_type}
                        style={{ width: '150px' }}
                        options={[
                            { value: PedalType.None, label: 'None' },
                            {
                                value: PedalType.DHSensor12,
                                label: 'DH-Sensor-12',
                            },
                            {
                                value: PedalType.BBSensor32,
                                label: 'BB-Sensor-32',
                            },
                            {
                                value: PedalType.DoubleSignal24,
                                label: 'DoubleSignal-24',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ pedal_type: e });
                            }
                        }}
                        // status="warning"
                    />
                    // </Tooltip>
                ),
            },
        ];
    }

    getDriveParameterItems(): DescriptionsProps['items'] {
        const {
            pedal_assist_level,
            pedal_speed_limit,
            pedal_slow_start_mode,
            pedal_signals_before_start,
            pedal_time_to_stop,
            pedal_current_decay,
            pedal_stop_decay,
            pedal_keep_current,
            pedal_speed_limit_unit,
            throttle_mode,
            throttle_assist_level,
            throttle_speed_limit,
            throttle_speed_limit_unit,
        } = this.state;
        return [
            {
                key: 'throttle_mode',
                label: 'Throttle mode',
                children: (
                    <Select
                        value={throttle_mode}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: ThrottleMode.Speed,
                                label: 'Speed',
                            },
                            {
                                value: ThrottleMode.Current,
                                label: 'Current',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ throttle_mode: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'pedal_assist_level',
                label: 'Pedal assist level (Designated Assist)',
                children: (
                    <Select
                        value={pedal_assist_level}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: AssistLevel.ByDisplay,
                                label: 'By display',
                            },
                            {
                                value: AssistLevel.AssistLevel0,
                                label: 'Level 0',
                            },
                            {
                                value: AssistLevel.AssistLevel1,
                                label: 'Level 1',
                            },
                            {
                                value: AssistLevel.AssistLevel2,
                                label: 'Level 2',
                            },
                            {
                                value: AssistLevel.AssistLevel3,
                                label: 'Level 3',
                            },
                            {
                                value: AssistLevel.AssistLevel4,
                                label: 'Level 4',
                            },
                            {
                                value: AssistLevel.AssistLevel5,
                                label: 'Level 5',
                            },
                            {
                                value: AssistLevel.AssistLevel6,
                                label: 'Level 6',
                            },
                            {
                                value: AssistLevel.AssistLevel7,
                                label: 'Level 7',
                            },
                            {
                                value: AssistLevel.AssistLevel8,
                                label: 'Level 8',
                            },
                            {
                                value: AssistLevel.AssistLevel9,
                                label: 'Level 9',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ pedal_assist_level: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'throttle_assist_level',
                label: 'Throttle assist level (Designated Assist)',
                children: (
                    <Select
                        value={throttle_assist_level}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: AssistLevel.ByDisplay,
                                label: 'By display',
                            },
                            {
                                value: AssistLevel.AssistLevel0,
                                label: 'Level 0',
                            },
                            {
                                value: AssistLevel.AssistLevel1,
                                label: 'Level 1',
                            },
                            {
                                value: AssistLevel.AssistLevel2,
                                label: 'Level 2',
                            },
                            {
                                value: AssistLevel.AssistLevel3,
                                label: 'Level 3',
                            },
                            {
                                value: AssistLevel.AssistLevel4,
                                label: 'Level 4',
                            },
                            {
                                value: AssistLevel.AssistLevel5,
                                label: 'Level 5',
                            },
                            {
                                value: AssistLevel.AssistLevel6,
                                label: 'Level 6',
                            },
                            {
                                value: AssistLevel.AssistLevel7,
                                label: 'Level 7',
                            },
                            {
                                value: AssistLevel.AssistLevel8,
                                label: 'Level 8',
                            },
                            {
                                value: AssistLevel.AssistLevel9,
                                label: 'Level 9',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ throttle_assist_level: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'pedal_speed_limit',
                label: 'Pedal speed limit',
                children: (
                    <ParameterInputComponent
                        value={
                            pedal_speed_limit === SpeedLimitByDisplay
                                ? null
                                : pedal_speed_limit
                        }
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    pedal_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: 'km/h' },
                                    {
                                        value: 'by_display',
                                        label: 'By display',
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        pedal_speed_limit: SpeedLimitByDisplay,
                                        pedal_speed_limit_unit: value,
                                    })
                                }
                            />
                        }
                        min={1}
                        max={60}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_speed_limit:
                                    pedal_speed_limit_unit === 'by_display'
                                        ? SpeedLimitByDisplay
                                        : e,
                            });
                        }}
                        warningText="Its illegal in most countries to set speed limit bigger than 25km/h"
                        warningBelow={0}
                        warningAbove={25}
                        disabled={pedal_speed_limit_unit === 'by_display'}
                    />
                ),
            },
            {
                key: 'throttle_speed_limit',
                label: 'Throttle speed limit',
                children: (
                    <ParameterInputComponent
                        value={
                            throttle_speed_limit === SpeedLimitByDisplay
                                ? null
                                : throttle_speed_limit
                        }
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    throttle_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: 'km/h' },
                                    {
                                        value: 'by_display',
                                        label: 'By display',
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        throttle_speed_limit:
                                            SpeedLimitByDisplay,
                                        throttle_speed_limit_unit: value,
                                    })
                                }
                            />
                        }
                        min={1}
                        max={60}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_speed_limit:
                                    throttle_speed_limit_unit === 'by_display'
                                        ? SpeedLimitByDisplay
                                        : e,
                            });
                        }}
                        warningText="Its illegal in most countries to use throttle"
                        warningBelow={0}
                        warningAbove={0}
                        disabled={throttle_speed_limit_unit === 'by_display'}
                    />
                ),
            },
            {
                key: 'slow_start_mode',
                label: 'Slow start mode',
                children: (
                    <ParameterInputComponent
                        value={pedal_slow_start_mode}
                        min={1}
                        max={8}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_slow_start_mode: e,
                            });
                        }}
                        warningText="Its not recommended to set slow start mode less than 3 (it can damage controller) and bigger than 5 (start will to slow)"
                        warningBelow={3}
                        warningAbove={5}
                    />
                ),
            },
            {
                key: 'signals_before_assist',
                label: 'Signals before assist (Start Degree, Signal No.)',
                children: (
                    <ParameterInputComponent
                        value={pedal_signals_before_start}
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_signals_before_start: e,
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 2 and bigger than number of signals per one rotation for your pedal sensor"
                        warningBelow={2}
                        warningAbove={32}
                    />
                ),
            },
            {
                key: 'time_before_end_of_assist',
                label: 'Time before end of assist (Time Of Stop, Stop Delay)',
                children: (
                    <ParameterInputComponent
                        value={pedal_time_to_stop}
                        unit="ms"
                        min={1}
                        max={1000}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_time_to_stop: e - (e % 10),
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 50 and bigger than 250"
                        warningBelow={50}
                        warningAbove={250}
                    />
                ),
            },
            {
                key: 'current_decay',
                label: 'Current decay',
                children: (
                    <ParameterInputComponent
                        value={pedal_current_decay}
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_current_decay: e,
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 4 and bigger than 8"
                        warningBelow={4}
                        warningAbove={8}
                    />
                ),
            },
            {
                key: 'stop_decay',
                label: 'Stop decay',
                children: (
                    <ParameterInputComponent
                        value={pedal_stop_decay}
                        unit="ms"
                        min={0}
                        max={500}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_stop_decay: e - (e % 10),
                            });
                        }}
                        warningText="Its recommended to set this parameter to 0"
                        warningBelow={0}
                        warningAbove={200}
                    />
                ),
            },
            {
                key: 'keep_current',
                label: 'Keep current',
                children: (
                    <ParameterInputComponent
                        value={pedal_keep_current}
                        unit="%"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_keep_current: e,
                            });
                        }}
                        warningText="Its recommended to keep this parameter in range 30-80"
                        warningBelow={30}
                        warningAbove={80}
                    />
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const { serial_number } = this.state;
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        value={serial_number}
                        maxLength={60}
                        onNewValue={(e) => {
                            this.setState({
                                serial_number: e,
                            });
                        }}
                        errorOnEmpty
                    />
                ),
            },
        ];
    }

    getInfoItems(): DescriptionsProps['items'] {
        const {
            manufacturer,
            model,
            hardware_version,
            firmware_version,
            voltage,
            max_current,
        } = this.state;
        return [
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: manufacturer,
            },
            {
                key: 'model',
                label: 'Model',
                children: model,
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: hardware_version,
            },
            {
                key: 'firmware_version',
                label: 'Firmware version',
                children: firmware_version,
            },
            {
                key: 'voltage',
                label: 'Voltage',
                children: voltage,
            },
            {
                key: 'max_current',
                label: 'Max current',
                children: max_current,
            },
        ];
    }

    getBasicParameterItems(): DescriptionsProps['items'] {
        const {
            voltage,
            low_battery_protection,
            max_current,
            current_limit,
            wheel_diameter,
            speedmeter_type,
        } = this.state;
        return [
            {
                key: 'low_voltage_protection',
                label: 'Low battery protection',
                children: (
                    <ParameterInputComponent
                        value={low_battery_protection}
                        unit="V"
                        min={0}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                low_battery_protection: e,
                            });
                        }}
                        warningText={`Its not recommended to set low voltage battery protection lower than ${lowVoltageLimits[voltage].min}V and higher that ${lowVoltageLimits[voltage].max}V on your system`}
                        warningBelow={lowVoltageLimits[voltage].min}
                        warningAbove={lowVoltageLimits[voltage].max}
                    />
                ),
            },
            {
                key: 'current_limit',
                label: 'Current limit',
                children: (
                    <ParameterInputComponent
                        value={current_limit}
                        unit="A"
                        min={1}
                        max={max_current}
                        onNewValue={(e) => {
                            this.setState({
                                current_limit: e,
                            });
                        }}
                        warningText={`Its not recommended to set current limit lower than 1A and higher that ${max_current}A on your system`}
                        warningBelow={1}
                        warningAbove={max_current}
                    />
                ),
            },
            {
                key: 'wheel_diameter',
                label: 'Wheel diameter',
                children: (
                    <ParameterInputComponent
                        value={wheel_diameter}
                        unit="″"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                wheel_diameter: e,
                            });
                        }}
                        warningText="Usually bike wheels has size in range from 12 to 29 inches"
                        warningBelow={12}
                        warningAbove={29}
                    />
                ),
            },
            {
                key: 'speedmeter_type',
                label: 'Speedmeter type',
                children: (
                    <Select
                        value={speedmeter_type}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: SpeedmeterType.External,
                                label: 'External',
                            },
                            {
                                value: SpeedmeterType.Internal,
                                label: 'Internal',
                            },
                            {
                                value: SpeedmeterType.Motorphase,
                                label: 'Motorphase',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ speedmeter_type: e });
                            }
                        }}
                    />
                ),
            },
        ];
    }

    getPedalParametersItems(): DescriptionsProps['items'] {
        const {
            pedal_type,
            pedal_assist_level,
            pedal_speed_limit,
            pedal_speed_limit_unit,
            pedal_start_current,
            pedal_slow_start_mode,
            pedal_signals_before_start,
            pedal_time_to_stop,
            pedal_current_decay,
            pedal_stop_decay,
            pedal_keep_current,
        } = this.state;
        return [
            {
                key: 'pedal_sensor_type',
                label: 'Pedal sensor type',
                children: (
                    <Select
                        value={pedal_type}
                        style={{ width: '150px' }}
                        options={[
                            { value: PedalType.None, label: 'None' },
                            {
                                value: PedalType.DHSensor12,
                                label: 'DH-Sensor-12',
                            },
                            {
                                value: PedalType.BBSensor32,
                                label: 'BB-Sensor-32',
                            },
                            {
                                value: PedalType.DoubleSignal24,
                                label: 'DoubleSignal-24',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ pedal_type: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'pedal_assist_level',
                label: 'Designated assist level',
                children: (
                    <Select
                        value={pedal_assist_level}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: AssistLevel.ByDisplay,
                                label: 'By display',
                            },
                            {
                                value: AssistLevel.AssistLevel0,
                                label: 'Level 0',
                            },
                            {
                                value: AssistLevel.AssistLevel1,
                                label: 'Level 1',
                            },
                            {
                                value: AssistLevel.AssistLevel2,
                                label: 'Level 2',
                            },
                            {
                                value: AssistLevel.AssistLevel3,
                                label: 'Level 3',
                            },
                            {
                                value: AssistLevel.AssistLevel4,
                                label: 'Level 4',
                            },
                            {
                                value: AssistLevel.AssistLevel5,
                                label: 'Level 5',
                            },
                            {
                                value: AssistLevel.AssistLevel6,
                                label: 'Level 6',
                            },
                            {
                                value: AssistLevel.AssistLevel7,
                                label: 'Level 7',
                            },
                            {
                                value: AssistLevel.AssistLevel8,
                                label: 'Level 8',
                            },
                            {
                                value: AssistLevel.AssistLevel9,
                                label: 'Level 9',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ pedal_assist_level: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'pedal_speed_limit',
                label: 'Speed limit',
                children: (
                    <ParameterInputComponent
                        value={
                            pedal_speed_limit === SpeedLimitByDisplay
                                ? null
                                : pedal_speed_limit
                        }
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    pedal_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: 'km/h' },
                                    {
                                        value: 'by_display',
                                        label: 'By display',
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        pedal_speed_limit: SpeedLimitByDisplay,
                                        pedal_speed_limit_unit: value,
                                    })
                                }
                            />
                        }
                        min={1}
                        max={60}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_speed_limit:
                                    pedal_speed_limit_unit === 'by_display'
                                        ? SpeedLimitByDisplay
                                        : e,
                            });
                        }}
                        warningText="Its illegal in most countries to set speed limit bigger than 25km/h"
                        warningBelow={0}
                        warningAbove={25}
                        disabled={pedal_speed_limit_unit === 'by_display'}
                    />
                ),
            },
            {
                key: 'pedal_start_current',
                label: 'Start current',
                children: (
                    <ParameterInputComponent
                        value={pedal_start_current}
                        unit="%"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_start_current: e,
                            });
                        }}
                        warningText="Its not recommended to set high pedal start current"
                        warningBelow={1}
                        warningAbove={30}
                    />
                ),
            },
            {
                key: 'slow_start_mode',
                label: 'Slow start mode',
                children: (
                    <ParameterInputComponent
                        value={pedal_slow_start_mode}
                        min={1}
                        max={8}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_slow_start_mode: e,
                            });
                        }}
                        warningText="Its not recommended to set slow start mode less than 3 (it can damage controller) and bigger than 5 (start will to slow)"
                        warningBelow={3}
                        warningAbove={5}
                    />
                ),
            },
            {
                key: 'signals_before_assist',
                label: 'Start degree (Signal No.)',
                children: (
                    <ParameterInputComponent
                        value={pedal_signals_before_start}
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_signals_before_start: e,
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 2 and bigger than number of signals per one rotation for your pedal sensor"
                        warningBelow={2}
                        warningAbove={32}
                    />
                ),
            },
            {
                key: 'time_before_end_of_assist',
                label: 'Stop Delay',
                children: (
                    <ParameterInputComponent
                        value={Math.floor(pedal_time_to_stop / 10)}
                        unit="10ms"
                        min={1}
                        max={1000}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_time_to_stop: e * 10,
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 40 and bigger than 250"
                        warningBelow={5}
                        warningAbove={25}
                    />
                ),
            },
            {
                key: 'current_decay',
                label: 'Current decay',
                children: (
                    <ParameterInputComponent
                        value={pedal_current_decay}
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_current_decay: e,
                            });
                        }}
                        warningText="Its not recommended to set this parameter lower than 4 and bigger than 8"
                        warningBelow={4}
                        warningAbove={8}
                    />
                ),
            },
            {
                key: 'stop_decay',
                label: 'Stop decay',
                children: (
                    <ParameterInputComponent
                        value={Math.floor(pedal_stop_decay / 10)}
                        unit="10ms"
                        min={0}
                        max={50}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_stop_decay: e * 10,
                            });
                        }}
                        warningText="Its recommended to set this parameter to 0"
                        warningBelow={0}
                        warningAbove={0}
                    />
                ),
            },
            {
                key: 'keep_current',
                label: 'Keep current',
                children: (
                    <ParameterInputComponent
                        value={pedal_keep_current}
                        unit="%"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                pedal_keep_current: e,
                            });
                        }}
                        warningText="Its recommended to keep this parameter in range 30-80"
                        warningBelow={30}
                        warningAbove={80}
                    />
                ),
            },
        ];
    }

    getThrottleParametersItems(): DescriptionsProps['items'] {
        const {
            throttle_start_voltage,
            throttle_end_voltage,
            throttle_mode,
            throttle_assist_level,
            throttle_speed_limit,
            throttle_speed_limit_unit,
            throttle_start_current,
        } = this.state;
        return [
            {
                key: 'throttle_start_voltage',
                label: 'Start voltage',
                children: (
                    <ParameterInputComponent
                        value={throttle_start_voltage * 10}
                        unit="100mV"
                        min={10}
                        max={1000}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_start_voltage: e / 10,
                            });
                        }}
                        warningText="Its not recommended to set lower start voltage than 1.1V"
                        warningBelow={11}
                    />
                ),
            },
            {
                key: 'throttle_end_voltage',
                label: 'End voltage',
                children: (
                    <ParameterInputComponent
                        value={throttle_end_voltage * 10}
                        unit="100mV"
                        min={10}
                        max={1000}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_end_voltage: e / 10,
                            });
                        }}
                        warningText="Its not recommended to set lower end voltage than 1.1V"
                        warningBelow={11}
                    />
                ),
            },
            {
                key: 'throttle_mode',
                label: 'Mode',
                children: (
                    <Select
                        value={throttle_mode}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: ThrottleMode.Speed,
                                label: 'Speed',
                            },
                            {
                                value: ThrottleMode.Current,
                                label: 'Current',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ throttle_mode: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'throttle_assist_level',
                label: 'Designated assist level',
                children: (
                    <Select
                        value={throttle_assist_level}
                        style={{ width: '150px' }}
                        options={[
                            {
                                value: AssistLevel.ByDisplay,
                                label: 'By display',
                            },
                            {
                                value: AssistLevel.AssistLevel0,
                                label: 'Level 0',
                            },
                            {
                                value: AssistLevel.AssistLevel1,
                                label: 'Level 1',
                            },
                            {
                                value: AssistLevel.AssistLevel2,
                                label: 'Level 2',
                            },
                            {
                                value: AssistLevel.AssistLevel3,
                                label: 'Level 3',
                            },
                            {
                                value: AssistLevel.AssistLevel4,
                                label: 'Level 4',
                            },
                            {
                                value: AssistLevel.AssistLevel5,
                                label: 'Level 5',
                            },
                            {
                                value: AssistLevel.AssistLevel6,
                                label: 'Level 6',
                            },
                            {
                                value: AssistLevel.AssistLevel7,
                                label: 'Level 7',
                            },
                            {
                                value: AssistLevel.AssistLevel8,
                                label: 'Level 8',
                            },
                            {
                                value: AssistLevel.AssistLevel9,
                                label: 'Level 9',
                            },
                        ]}
                        onChange={(e) => {
                            if (e != null) {
                                this.setState({ throttle_assist_level: e });
                            }
                        }}
                    />
                ),
            },
            {
                key: 'throttle_speed_limit',
                label: 'Speed limit',
                children: (
                    <ParameterInputComponent
                        value={
                            throttle_speed_limit === SpeedLimitByDisplay
                                ? null
                                : throttle_speed_limit
                        }
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    throttle_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: 'km/h' },
                                    {
                                        value: 'by_display',
                                        label: 'By display',
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        throttle_speed_limit:
                                            SpeedLimitByDisplay,
                                        throttle_speed_limit_unit: value,
                                    })
                                }
                            />
                        }
                        min={1}
                        max={60}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_speed_limit:
                                    throttle_speed_limit_unit === 'by_display'
                                        ? SpeedLimitByDisplay
                                        : e,
                            });
                        }}
                        warningText="Its illegal in most countries to use throttle"
                        warningBelow={0}
                        warningAbove={0}
                        disabled={throttle_speed_limit_unit === 'by_display'}
                    />
                ),
            },
            {
                key: 'throttle_start_current',
                label: 'Start current',
                children: (
                    <ParameterInputComponent
                        value={throttle_start_current}
                        unit="%"
                        min={1}
                        max={100}
                        onNewValue={(e) => {
                            this.setState({
                                throttle_start_current: e,
                            });
                        }}
                        warningText="Its not recommended to set lower start current than 10% and higher than 20%"
                        warningBelow={10}
                        warningAbove={20}
                    />
                ),
            },
        ];
    }

    getAssistLevelTableData(): AssistTableRow[] {
        const { assist_profiles } = this.state;
        let i = 0;
        return assist_profiles.map((profile) => {
            return {
                tip:
                    i === 0
                        ? 'Its strongly recommended to set current limit on zero level of assist to 0'
                        : '',
                recommended_min: 0,
                recommended_max: i === 0 ? 0 : 100,
                key: i,
                assist_level: i++,
                current: profile.current_limit,
                speed: profile.speed_limit,
            };
        });
    }

    updateData(): void {
        const { connection } = this.props;
        this.initial_info = connection.getInfo();
        this.initial_basic_parameters = connection.getBasicParameters();
        this.initial_pedal_parameters = connection.getPedalParameters();
        this.initial_throttle_parameters = connection.getThrottleParameters();
        this.setState({
            ...this.initial_info,
            ...this.initial_basic_parameters,
            ...this.initial_pedal_parameters,
            ...this.initial_throttle_parameters,
            lastUpdateTime: Date.now(),
        });
    }

    saveParameters(): void {
        const { connection } = this.props;
        const info: BafangUartMotorInfo = this.state as BafangUartMotorInfo;
        const basic_parameters: BafangUartMotorBasicParameters = this
            .state as BafangUartMotorBasicParameters;
        const pedal_parameters: BafangUartMotorPedalParameters = this
            .state as BafangUartMotorPedalParameters;
        const throttle_parameters: BafangUartMotorThrottleParameters = this
            .state as BafangUartMotorThrottleParameters;
        connection.setSerialNumber(info.serial_number);
        connection.setBasicParameters(basic_parameters);
        connection.setPedalParameters(pedal_parameters);
        connection.setThrottleParameters(throttle_parameters);
        this.packages_written = 0;
        connection.saveData();
        setTimeout(() => {
            if (this.packages_written === 3) {
                message.success('Parameters saved successfully!');
            } else {
                message.error('Error during writing!');
            }
        }, 3000);
    }

    render() {
        const { connection } = this.props;
        const { oldStyle } = this.state;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Settings
                </Typography.Title>
                <br />
                <Typography.Title level={5} style={{ margin: 0 }}>
                    Old style layout&nbsp;&nbsp;
                    <Switch
                        checked={oldStyle}
                        onChange={(value) => this.setState({ oldStyle: value })}
                    />
                </Typography.Title>
                <br />
                {!oldStyle && (
                    <>
                        <Descriptions
                            bordered
                            title="Electrical parameters"
                            items={this.getElectricalParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title="Physical parameters"
                            items={this.getPhysicalParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Title level={5}>Assist levels</Title>
                        <Table
                            dataSource={this.getAssistLevelTableData()}
                            pagination={{ position: ['none', 'none'] }}
                            style={{ marginBottom: '20px' }}
                        >
                            <Column
                                title="Assist"
                                dataIndex="assist_level"
                                key="assist_level"
                            />
                            <Column
                                title="Current"
                                dataIndex="current"
                                key="current"
                                render={(_: any, record: AssistTableRow) => (
                                    <ParameterInputComponent
                                        value={record.current}
                                        unit="%"
                                        min={0}
                                        max={100}
                                        onNewValue={(e) => {
                                            const { assist_profiles } =
                                                this.state;
                                            assist_profiles[
                                                record.assist_level
                                            ] = {
                                                current_limit: e,
                                                speed_limit:
                                                    assist_profiles[
                                                        record.assist_level
                                                    ].speed_limit,
                                            };
                                            this.setState({
                                                assist_profiles,
                                            });
                                        }}
                                        warningText={record.tip}
                                        warningBelow={record.recommended_min}
                                        warningAbove={record.recommended_max}
                                    />
                                )}
                            />
                            <Column
                                title="Speed"
                                dataIndex="Speed"
                                key="tags"
                                render={(_: any, record: AssistTableRow) => (
                                    <ParameterInputComponent
                                        value={record.speed}
                                        unit="%"
                                        min={0}
                                        max={100}
                                        onNewValue={(e) => {
                                            const { assist_profiles } =
                                                this.state;
                                            assist_profiles[
                                                record.assist_level
                                            ] = {
                                                current_limit:
                                                    assist_profiles[
                                                        record.assist_level
                                                    ].current_limit,
                                                speed_limit: e,
                                            };
                                            this.setState({
                                                assist_profiles,
                                            });
                                        }}
                                    />
                                )}
                            />
                        </Table>
                        <Descriptions
                            bordered
                            title="Drive parameters"
                            items={this.getDriveParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title="Other"
                            items={this.getOtherItems()}
                            column={1}
                        />
                    </>
                )}
                {oldStyle && (
                    <>
                        <Descriptions
                            bordered
                            title="Info"
                            items={this.getInfoItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title="Basic parameters"
                            items={this.getBasicParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Table
                            dataSource={this.getAssistLevelTableData()}
                            pagination={{ position: ['none', 'none'] }}
                            style={{ marginBottom: '20px' }}
                        >
                            <Column
                                title="Assist levels"
                                dataIndex="assist_level"
                                key="assist_level"
                            />
                            <Column
                                title="Current limit"
                                dataIndex="current"
                                key="current"
                                render={(_: any, record: AssistTableRow) => (
                                    <ParameterInputComponent
                                        value={record.current}
                                        unit="%"
                                        min={0}
                                        max={100}
                                        onNewValue={(e) => {
                                            const { assist_profiles } =
                                                this.state;
                                            assist_profiles[
                                                record.assist_level
                                            ] = {
                                                current_limit: e,
                                                speed_limit:
                                                    assist_profiles[
                                                        record.assist_level
                                                    ].speed_limit,
                                            };
                                            this.setState({
                                                assist_profiles,
                                            });
                                        }}
                                        warningText={record.tip}
                                        warningBelow={record.recommended_min}
                                        warningAbove={record.recommended_max}
                                    />
                                )}
                            />
                            <Column
                                title="Speed limit"
                                dataIndex="Speed"
                                key="tags"
                                render={(_: any, record: AssistTableRow) => (
                                    <ParameterInputComponent
                                        value={record.speed}
                                        unit="%"
                                        min={0}
                                        max={100}
                                        onNewValue={(e) => {
                                            const { assist_profiles } =
                                                this.state;
                                            assist_profiles[
                                                record.assist_level
                                            ] = {
                                                current_limit:
                                                    assist_profiles[
                                                        record.assist_level
                                                    ].current_limit,
                                                speed_limit: e,
                                            };
                                            this.setState({
                                                assist_profiles,
                                            });
                                        }}
                                    />
                                )}
                            />
                        </Table>
                        <Descriptions
                            bordered
                            title="Pedal parameters"
                            items={this.getPedalParametersItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title="Throttle parameters"
                            items={this.getThrottleParametersItems()}
                            column={1}
                        />
                    </>
                )}
                <FloatButton
                    icon={<SyncOutlined />}
                    type="primary"
                    style={{ right: 94 }}
                    onClick={() => {
                        connection.loadData();
                        message.open({
                            key: 'loading',
                            type: 'loading',
                            content: 'Loading...',
                        });
                        setTimeout(() => {
                            const { lastUpdateTime } = this.state;
                            if (Date.now() - lastUpdateTime < 3000) {
                                message.open({
                                    key: 'loading',
                                    type: 'success',
                                    content: 'Read sucessfully!',
                                    duration: 2,
                                });
                            } else {
                                message.open({
                                    key: 'loading',
                                    type: 'error',
                                    content: 'Error during reading!',
                                    duration: 2,
                                });
                            }
                        }, 3000);
                    }}
                />
                <FloatButton
                    icon={<RocketOutlined />}
                    type="primary"
                    style={{ right: 24 }}
                    onClick={this.saveParameters}
                />
            </div>
        );
    }
}

export default BafangUartMotorSettingsView;
