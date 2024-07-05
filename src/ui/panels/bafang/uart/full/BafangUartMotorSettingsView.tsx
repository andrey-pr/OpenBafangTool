import React from 'react';
import {
    Typography,
    Descriptions,
    Select,
    FloatButton,
    message,
    Switch,
    Popconfirm,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../../../../device/high-level/BafangUartMotor';
import {
    AssistLevel,
    AssistLevelOptions,
    BafangUartMotorBasicParameters,
    BafangUartMotorInfo,
    BafangUartMotorPedalParameters,
    BafangUartMotorThrottleParameters,
    ParameterNames,
    PedalType,
    PedalTypeOptions,
    SpeedLimitByDisplay,
    SpeedmeterType,
    SpeedmeterTypeOptions,
    ThrottleMode,
    ThrottleModeOptions,
} from '../../../../../types/BafangUartMotorTypes';
import { lowVoltageLimits } from '../../../../../constants/parameter_limits';
import ParameterInputComponent from '../../../../components/ParameterInput';
import {
    generateEditableNumberListItem,
    generateEditableNumberListItemWithWarning,
    generateEditableSelectListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import AssistLevelTableComponent from '../../../../components/AssistLevelTableComponent';

const { Title } = Typography;

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
        return [
            generateEditableNumberListItemWithWarning(
                'Low voltage battery protection',
                this.state.low_battery_protection,
                `Its not recommended to set low voltage battery protection lower than ${
                    lowVoltageLimits[this.state.voltage].min
                }V and higher that ${
                    lowVoltageLimits[this.state.voltage].max
                }V on your system`,
                lowVoltageLimits[this.state.voltage].min,
                lowVoltageLimits[this.state.voltage].max,
                (low_battery_protection) =>
                    this.setState({ low_battery_protection }),
                'V',
                0,
                100,
            ),
            generateEditableNumberListItem(
                'Current limit',
                this.state.current_limit,
                (current_limit) => this.setState({ current_limit }),
                'A',
                1,
                this.state.max_current,
            ),
            generateEditableNumberListItemWithWarning(
                'Pedal start current',
                this.state.pedal_start_current,
                'Its not recommended to set high pedal start current',
                1,
                30,
                (pedal_start_current) => this.setState({ pedal_start_current }),
                '%',
                1,
                100,
            ),
            generateEditableNumberListItemWithWarning(
                'Throttle start voltage',
                this.state.throttle_start_voltage,
                'Its not recommended to set lower start voltage than 1.1V',
                1.1,
                20,
                (throttle_start_voltage) =>
                    this.setState({ throttle_start_voltage }),
                'V',
                1,
                20,
                1,
            ),
            generateEditableNumberListItemWithWarning(
                'Throttle end voltage',
                this.state.throttle_end_voltage,
                'Its not recommended to set lower end voltage than 1.1V',
                1.1,
                20,
                (throttle_end_voltage) =>
                    this.setState({ throttle_end_voltage }),
                'V',
                1,
                20,
                1,
            ),
            generateEditableNumberListItemWithWarning(
                'Throttle start current',
                this.state.throttle_start_current,
                'Its not recommended to set lower start current than 10% and higher than 20%',
                10,
                20,
                (throttle_start_current) =>
                    this.setState({ throttle_start_current }),
                '%',
                1,
                100,
            ),
        ];
    }

    getPhysicalParameterItems(): DescriptionsProps['items'] {
        return [
            generateEditableNumberListItemWithWarning(
                'Wheel diameter',
                this.state.wheel_diameter,
                'Usually bike wheels has size in range from 12 to 29 inches',
                12,
                29,
                (wheel_diameter) => this.setState({ wheel_diameter }),
                '″',
                1,
                100,
            ),
            generateEditableSelectListItem(
                'Speedmeter type',
                SpeedmeterTypeOptions,
                this.state.speedmeter_type,
                (e) => this.setState({ speedmeter_type: e as SpeedmeterType }),
            ),
            generateEditableSelectListItem(
                'Pedal sensor type',
                PedalTypeOptions,
                this.state.pedal_type,
                (e) => this.setState({ pedal_type: e as PedalType }),
            ),
        ];
    }

    getDriveParameterItems(): DescriptionsProps['items'] {
        const {
            pedal_speed_limit,
            pedal_time_to_stop,
            pedal_stop_decay,
            pedal_speed_limit_unit,
            throttle_speed_limit,
            throttle_speed_limit_unit,
        } = this.state;
        return [
            generateEditableSelectListItem(
                'Throttle mode',
                ThrottleModeOptions,
                this.state.throttle_mode,
                (e) => this.setState({ throttle_mode: e as ThrottleMode }),
            ),
            generateEditableSelectListItem(
                'Pedal assist level (Designated Assist)',
                AssistLevelOptions,
                this.state.pedal_assist_level,
                (e) => this.setState({ pedal_assist_level: e as AssistLevel }),
            ),
            generateEditableSelectListItem(
                'Throttle assist level (Designated Assist)',
                AssistLevelOptions,
                this.state.throttle_assist_level,
                (e) =>
                    this.setState({ throttle_assist_level: e as AssistLevel }),
            ),
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
            generateEditableNumberListItemWithWarning(
                'Slow start mode',
                this.state.pedal_slow_start_mode,
                'Its not recommended to set slow start mode less than 3 (it can damage controller) and bigger than 5 (start will to slow)',
                3,
                5,
                (pedal_slow_start_mode) =>
                    this.setState({ pedal_slow_start_mode }),
                '',
                1,
                8,
            ),
            generateEditableNumberListItemWithWarning(
                'Signals before assist (Start Degree, Signal No.)',
                this.state.pedal_signals_before_start,
                'Its not recommended to set this parameter lower than 2 and bigger than number of signals per one rotation for your pedal sensor',
                2,
                32,
                (pedal_signals_before_start) =>
                    this.setState({ pedal_signals_before_start }),
                '',
                1,
                100,
            ),
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
            generateEditableNumberListItemWithWarning(
                'Current decay',
                this.state.pedal_current_decay,
                'Its not recommended to set this parameter lower than 4 and bigger than 8',
                4,
                8,
                (pedal_current_decay) => this.setState({ pedal_current_decay }),
                '',
                1,
                100,
            ),
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
            generateEditableNumberListItemWithWarning(
                'Keep current',
                this.state.pedal_keep_current,
                'Its recommended to keep this parameter in range 30-80',
                30,
                80,
                (pedal_keep_current) => this.setState({ pedal_keep_current }),
                '%',
                1,
                100,
            ),
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                'Serial number',
                this.state.serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
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
            generateSimpleStringListItem('Manufacturer', manufacturer),
            generateSimpleStringListItem('Model', model),
            generateSimpleStringListItem('Hardware version', hardware_version),
            generateSimpleStringListItem('Firmware version', firmware_version),
            generateSimpleStringListItem('Voltage', voltage),
            generateSimpleStringListItem('Max current', max_current),
        ];
    }

    getBasicParameterItems(): DescriptionsProps['items'] {
        return [
            generateEditableNumberListItemWithWarning(
                'Low battery protection',
                this.state.low_battery_protection,
                `Its not recommended to set low voltage battery protection lower than ${
                    lowVoltageLimits[this.state.voltage].min
                }V and higher that ${
                    lowVoltageLimits[this.state.voltage].max
                }V on your system`,
                lowVoltageLimits[this.state.voltage].min,
                lowVoltageLimits[this.state.voltage].max,
                (low_battery_protection) =>
                    this.setState({ low_battery_protection }),
                'V',
                0,
                100,
            ),
            generateEditableNumberListItem(
                'Current limit',
                this.state.current_limit,
                (current_limit) => this.setState({ current_limit }),
                'A',
                1,
                this.state.max_current,
            ),
            generateEditableNumberListItemWithWarning(
                'Wheel diameter',
                this.state.wheel_diameter,
                'Usually bike wheels has size in range from 12 to 29 inches',
                12,
                29,
                (wheel_diameter) => this.setState({ wheel_diameter }),
                '″',
                1,
                100,
            ),
            generateEditableSelectListItem(
                'Speedmeter type',
                SpeedmeterTypeOptions,
                this.state.speedmeter_type,
                (e) => this.setState({ speedmeter_type: e as SpeedmeterType }),
            ),
        ];
    }

    getPedalParametersItems(): DescriptionsProps['items'] {
        const {
            pedal_speed_limit,
            pedal_speed_limit_unit,
            pedal_time_to_stop,
            pedal_stop_decay,
        } = this.state;
        return [
            generateEditableSelectListItem(
                'Pedal sensor type',
                PedalTypeOptions,
                this.state.pedal_type,
                (e) => this.setState({ pedal_type: e as PedalType }),
            ),
            generateEditableSelectListItem(
                'Designated assist level',
                AssistLevelOptions,
                this.state.pedal_assist_level,
                (e) => this.setState({ pedal_assist_level: e as AssistLevel }),
            ),
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
            generateEditableNumberListItemWithWarning(
                'Start current',
                this.state.pedal_start_current,
                'Its not recommended to set high pedal start current',
                1,
                30,
                (pedal_start_current) => this.setState({ pedal_start_current }),
                '%',
                1,
                100,
            ),
            generateEditableNumberListItemWithWarning(
                'Slow start mode',
                this.state.pedal_slow_start_mode,
                'Its not recommended to set slow start mode less than 3 (it can damage controller) and bigger than 5 (start will to slow)',
                3,
                5,
                (pedal_slow_start_mode) =>
                    this.setState({ pedal_slow_start_mode }),
                '',
                1,
                8,
            ),
            generateEditableNumberListItemWithWarning(
                'Start degree (Signal No.)',
                this.state.pedal_signals_before_start,
                'Its not recommended to set this parameter lower than 2 and bigger than number of signals per one rotation for your pedal sensor',
                2,
                32,
                (pedal_signals_before_start) =>
                    this.setState({ pedal_signals_before_start }),
                '',
                1,
                100,
            ),
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
            generateEditableNumberListItemWithWarning(
                'Current decay',
                this.state.pedal_current_decay,
                'Its not recommended to set this parameter lower than 4 and bigger than 8',
                4,
                8,
                (pedal_current_decay) => this.setState({ pedal_current_decay }),
                '',
                1,
                100,
            ),
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
            generateEditableNumberListItemWithWarning(
                'Keep current',
                this.state.pedal_keep_current,
                'Its recommended to keep this parameter in range 30-80',
                30,
                80,
                (pedal_keep_current) => this.setState({ pedal_keep_current }),
                '%',
                1,
                100,
            ),
        ];
    }

    getThrottleParametersItems(): DescriptionsProps['items'] {
        const {
            throttle_start_voltage,
            throttle_end_voltage,
            throttle_speed_limit,
            throttle_speed_limit_unit,
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
            generateEditableSelectListItem(
                'Mode',
                ThrottleModeOptions,
                this.state.throttle_mode,
                (e) => this.setState({ throttle_mode: e as ThrottleMode }),
            ),
            generateEditableSelectListItem(
                'Designated assist level',
                AssistLevelOptions,
                this.state.throttle_assist_level,
                (e) =>
                    this.setState({ throttle_assist_level: e as AssistLevel }),
            ),
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
            generateEditableNumberListItemWithWarning(
                'Start current',
                this.state.throttle_start_current,
                'Its not recommended to set lower start current than 10% and higher than 20%',
                10,
                20,
                (throttle_start_current) =>
                    this.setState({ throttle_start_current }),
                '%',
                1,
                100,
            ),
        ];
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
                        <AssistLevelTableComponent
                            assist_profiles={this.state.assist_profiles}
                            onChange={(assist_profiles) =>
                                this.setState({ assist_profiles })
                            }
                            zero_level
                        />
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
                        <AssistLevelTableComponent
                            assist_profiles={this.state.assist_profiles}
                            onChange={(assist_profiles) =>
                                this.setState({ assist_profiles })
                            }
                            zero_level
                        />
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
                <Popconfirm
                    title="Parameter writing"
                    description="Are you sure that you want to write all parameters on device?"
                    onConfirm={this.saveParameters}
                    okText="Yes"
                    cancelText="No"
                >
                    <FloatButton
                        icon={<DeliveredProcedureOutlined />}
                        type="primary"
                        style={{ right: 24 }}
                    />
                </Popconfirm>
            </div>
        );
    }
}

export default BafangUartMotorSettingsView;
