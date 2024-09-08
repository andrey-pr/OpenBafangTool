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
    generateAnnotatedEditableNumberListItem,
    generateAnnotatedEditableNumberListItemWithWarning,
    generateEditableNumberListItem,
    generateEditableNumberListItemWithWarning,
    generateEditableSelectListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import AssistLevelTableComponent from '../../../../components/AssistLevelTableComponent';
import i18n from '../../../../../i18n/i18n';

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
                i18n.t('battery_low_limit'),
                this.state.low_battery_protection,
                i18n.t('battery_low_limit_warning', {
                    min: lowVoltageLimits[this.state.voltage].min,
                    max: lowVoltageLimits[this.state.voltage].max,
                }),
                lowVoltageLimits[this.state.voltage].min,
                lowVoltageLimits[this.state.voltage].max,
                (low_battery_protection) =>
                    this.setState({ low_battery_protection }),
                i18n.t('v'),
                0,
                100,
            ),
            generateEditableNumberListItem(
                i18n.t('current_limit'),
                this.state.current_limit,
                (current_limit) => this.setState({ current_limit }),
                i18n.t('a'),
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
                i18n.t('throttle_start_voltage'),
                this.state.throttle_start_voltage,
                i18n.t('throttle_start_voltage_warning'),
                1.1,
                20,
                (throttle_start_voltage) =>
                    this.setState({ throttle_start_voltage }),
                i18n.t('v'),
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
                i18n.t('v'),
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
            generateAnnotatedEditableNumberListItemWithWarning(
                i18n.t('wheel_diameter'),
                this.state.wheel_diameter,
                i18n.t('wheel_diameter_warning'),
                12,
                29,
                (wheel_diameter) => this.setState({ wheel_diameter }),
                'NEVER try to set wrong wheel diameter - its illegal, because it will lead to incorrect speed measurement',
                '″',
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItemWithWarning(
                'Number of speed meter magnets on wheel',
                this.state.magnets_per_wheel_rotation,
                'Normally bike have only one speed meter magnet. Incorrect value of this setting will lead to incorrect speed measuring',
                1,
                1,
                (magnets_per_wheel_rotation) =>
                    this.setState({ magnets_per_wheel_rotation }),
                'NEVER try to set wrong magnet number - it may be illegal, because it will lead to incorrect speed measurement',
                '',
                1,
                10,
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
                        nullIsOk
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    pedal_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: i18n.t('km/h') },
                                    {
                                        value: 'by_display',
                                        label: i18n.t('by_display'),
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        pedal_speed_limit:
                                            value === 'by_display'
                                                ? SpeedLimitByDisplay
                                                : 25,
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
                        nullIsOk
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    throttle_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: i18n.t('km/h') },
                                    {
                                        value: 'by_display',
                                        label: i18n.t('by_display'),
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        throttle_speed_limit:
                                            value === 'by_display'
                                                ? SpeedLimitByDisplay
                                                : 5,
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
                        unit={i18n.t('ms')}
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
                label: i18n.t('pedal_stop_decay'),
                children: (
                    <ParameterInputComponent
                        value={pedal_stop_decay}
                        unit={i18n.t('ms')}
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
                i18n.t('serial_number'),
                this.state.serial_number,
                i18n.t('serial_number_warning'),
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
            generateSimpleStringListItem(i18n.t('manufacturer'), manufacturer),
            generateSimpleStringListItem(i18n.t('model_number'), model),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('software_version'),
                firmware_version,
            ),
            generateSimpleStringListItem(i18n.t('voltage'), voltage),
            generateSimpleStringListItem(i18n.t('max_current'), max_current),
        ];
    }

    getBasicParameterItems(): DescriptionsProps['items'] {
        return [
            generateEditableNumberListItemWithWarning(
                i18n.t('low_battery_protection'),
                this.state.low_battery_protection,
                i18n.t('battery_low_limit_warning', {
                    min: lowVoltageLimits[this.state.voltage].min,
                    max: lowVoltageLimits[this.state.voltage].max,
                }),
                lowVoltageLimits[this.state.voltage].min,
                lowVoltageLimits[this.state.voltage].max,
                (low_battery_protection) =>
                    this.setState({ low_battery_protection }),
                i18n.t('v'),
                0,
                100,
            ),
            generateEditableNumberListItem(
                i18n.t('current_limit'),
                this.state.current_limit,
                (current_limit) => this.setState({ current_limit }),
                i18n.t('a'),
                1,
                this.state.max_current,
            ),
            generateEditableNumberListItemWithWarning(
                i18n.t('wheel_diameter'),
                this.state.wheel_diameter,
                i18n.t('wheel_diameter_warning'),
                12,
                29,
                (wheel_diameter) => this.setState({ wheel_diameter }),
                '″',
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItemWithWarning(
                'Speed meter signals',
                this.state.magnets_per_wheel_rotation,
                'Normally bike have only one speed meter magnet. Incorrect value of this setting will lead to incorrect speed measuring',
                1,
                1,
                (magnets_per_wheel_rotation) =>
                    this.setState({ magnets_per_wheel_rotation }),
                'NEVER try to set wrong magnet number - its illegal, because it will lead to incorrect speed measurement',
                '',
                1,
                10,
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
                        nullIsOk
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    pedal_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: i18n.t('km/h') },
                                    {
                                        value: 'by_display',
                                        label: i18n.t('by_display'),
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        pedal_speed_limit:
                                            value === 'by_display'
                                                ? SpeedLimitByDisplay
                                                : 25,
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
                i18n.t('current_decay_old'),
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
                label: i18n.t('pedal_stop_decay_old'),
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
                        unit={`100${i18n.t('mv')}`}
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
                        unit={`100${i18n.t('mv')}`}
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
                i18n.t('mode'),
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
                        nullIsOk
                        unit={
                            <Select
                                style={{ minWidth: '100px' }}
                                defaultValue={
                                    throttle_speed_limit === SpeedLimitByDisplay
                                        ? 'by_display'
                                        : 'kmh'
                                }
                                options={[
                                    { value: 'kmh', label: i18n.t('km/h') },
                                    {
                                        value: 'by_display',
                                        label: i18n.t('by_display'),
                                    },
                                ]}
                                onChange={(value) =>
                                    this.setState({
                                        throttle_speed_limit:
                                            value === 'by_display'
                                                ? SpeedLimitByDisplay
                                                : 5,
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
                    {i18n.t('uart_motor_parameters_title')}
                </Typography.Title>
                <br />
                <Typography.Title level={5} style={{ margin: 0 }}>
                    {i18n.t('old_style_layout')}&nbsp;&nbsp;
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
                            title={i18n.t('electric_parameters')}
                            items={this.getElectricalParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title={i18n.t('mechanical_parameters')}
                            items={this.getPhysicalParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Title level={5}>{i18n.t('assist_table_title')}</Title>
                        <AssistLevelTableComponent
                            assist_profiles={this.state.assist_profiles}
                            onChange={(assist_profiles) =>
                                this.setState({ assist_profiles })
                            }
                            zero_level
                        />
                        <Descriptions
                            bordered
                            title={i18n.t('driving_parameters')}
                            items={this.getDriveParameterItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title={i18n.t('version_list_title')}
                            items={this.getOtherItems()}
                            column={1}
                        />
                    </>
                )}
                {oldStyle && (
                    <>
                        <Descriptions
                            bordered
                            title={i18n.t('info')}
                            items={this.getInfoItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title={i18n.t('basic_parameters')}
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
                            title={i18n.t('pedal_parameters')}
                            items={this.getPedalParametersItems()}
                            column={1}
                            style={{ marginBottom: '20px' }}
                        />
                        <Descriptions
                            bordered
                            title={i18n.t('throttle_parameters')}
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
                            content: i18n.t('loading'),
                        });
                        setTimeout(() => {
                            const { lastUpdateTime } = this.state;
                            if (Date.now() - lastUpdateTime < 3000) {
                                message.open({
                                    key: 'loading',
                                    type: 'success',
                                    content: i18n.t('loaded_successfully'),
                                    duration: 2,
                                });
                            } else {
                                message.open({
                                    key: 'loading',
                                    type: 'error',
                                    content: i18n.t('loading_error'),
                                    duration: 2,
                                });
                            }
                        }, 3000);
                    }}
                />
                <Popconfirm
                    title={i18n.t('parameter_writing_title')}
                    description={i18n.t('parameter_writing_confirm')}
                    onConfirm={this.saveParameters}
                    okText={i18n.t('yes')}
                    cancelText={i18n.t('no')}
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
