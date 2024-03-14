import React from 'react';
import {
    Typography,
    Descriptions,
    Table,
    Select,
    FloatButton,
    message,
    Radio,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, RocketOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../device/BafangUartMotor';
import {
    BafangUartMotorBasicParameters,
    BafangUartMotorInfo,
    BafangUartMotorPedalParameters,
    BafangUartMotorThrottleParameters,
    ParameterNames,
    PedalSensorSignals,
    SpeedLimitByDisplay,
    ThrottleMode,
} from '../../device/UartTypes';
import {
    BatteryTypes,
    LowVoltageLimitsByBatteryType,
    lowVoltageLimits,
} from '../../constants/parameter_limits';
import ParameterInputComponent from '../components/ParameterInput';

const { Title } = Typography;

const { Column } = Table;

type AssistTableRow = {
    key: React.Key;
    assist_level: number;
    current: number;
    speed: number;
};

type SettingsProps = {
    connection: BafangUartMotor;
};

type SettingsState = BafangUartMotorInfo &
    BafangUartMotorBasicParameters &
    BafangUartMotorPedalParameters &
    BafangUartMotorThrottleParameters & {
        lastUpdateTime: number;
    };

/* eslint-disable camelcase */
class BafangUartMotorSettingsSimplifiedView extends React.Component<
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
            lastUpdateTime: 0,
        };
        this.getInfoItems = this.getInfoItems.bind(this);
        this.getElectricalParameterItems =
            this.getElectricalParameterItems.bind(this);
        this.getPhysicalParameterItems =
            this.getPhysicalParameterItems.bind(this);
        this.getDriveParameterItems = this.getDriveParameterItems.bind(this);
        this.getThrottleItems = this.getThrottleItems.bind(this);
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

    getInfoItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            {
                key: 'serial_number',
                label: (
                    <>
                        Serial number
                        <br />
                        <br />
                        <Typography.Text italic>
                            Note, that serial number is changeable, so its not a
                            secure anti-theft feature
                        </Typography.Text>
                    </>
                ),
                children: info.serial_number,
            },
            {
                key: 'voltage',
                label: 'Voltage',
                children: info.voltage,
            },
            {
                key: 'max_current',
                label: (
                    <>
                        Max current
                        <br />
                        <br />
                        <Typography.Text italic>
                            Note, that Voltage*Max Current is a maximal
                            <br />
                            power, but not nominal. If you have legal motor
                            <br />
                            certified as 250W, and Voltage*Max Current is twice
                            <br />
                            or even triple bigger its normal - 250W is a nominal
                            <br />
                            (continuous) power, and its legal to use device that
                            <br />
                            can have bigger maximal power. For example, some of
                            <br />
                            Shimano STEPS motors that certified for 250W
                            pedelecs have
                            <br />
                            600W of max power.
                        </Typography.Text>
                    </>
                ),
                children: info.max_current,
            },
        ];
    }

    getElectricalParameterItems(): DescriptionsProps['items'] {
        const { voltage, low_battery_protection } = this.state;
        const voltageLimits = [
            {
                label: `Leave old value - ${this.initial_basic_parameters.low_battery_protection}V`,
                value: this.initial_basic_parameters.low_battery_protection,
            },
        ];
        if (LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiIon] !== -1) {
            voltageLimits.push({
                label: `Li-Ion (normal) - ${
                    LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiIon]
                }V`,
                value: LowVoltageLimitsByBatteryType[voltage][
                    BatteryTypes.LiIon
                ],
            });
        }
        if (LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiPo] !== -1) {
            voltageLimits.push({
                label: `Li-Po - ${
                    LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiPo]
                }V`,
                value: LowVoltageLimitsByBatteryType[voltage][
                    BatteryTypes.LiPo
                ],
            });
        }
        if (
            LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiFePo4] !== -1
        ) {
            voltageLimits.push({
                label: `LiFePo4 - ${
                    LowVoltageLimitsByBatteryType[voltage][BatteryTypes.LiFePo4]
                }V`,
                value: LowVoltageLimitsByBatteryType[voltage][
                    BatteryTypes.LiFePo4
                ],
            });
        }

        return [
            {
                key: 'low_voltage_protection',
                label: 'Low voltage battery protection',
                children: (
                    <Radio.Group
                        options={voltageLimits}
                        onChange={(e) => {
                            this.setState({
                                low_battery_protection: e.target.value,
                            });
                        }}
                        value={low_battery_protection}
                        optionType="button"
                        buttonStyle="solid"
                    />
                ),
            },
        ];
    }

    getPhysicalParameterItems(): DescriptionsProps['items'] {
        const { wheel_diameter } = this.state;
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
        ];
    }

    getDriveParameterItems(): DescriptionsProps['items'] {
        const {
            pedal_speed_limit,
            pedal_signals_before_start,
            pedal_time_to_stop,
            pedal_type,
        } = this.state;
        return [
            {
                key: 'pedal_speed_limit',
                label: (
                    <>
                        Pedal speed limit
                        <br />
                        <br />
                        <Typography.Text italic>
                            Note that its illegal to set bigger speed limit that
                            <br />
                            its allowed in your country. Check your local laws
                            <br />
                            before changing it
                        </Typography.Text>
                    </>
                ),
                children: (
                    <Radio.Group
                        options={[
                            {
                                label: `Leave old value - ${
                                    this.initial_pedal_parameters
                                        .pedal_speed_limit ==
                                    SpeedLimitByDisplay
                                        ? 'By display'
                                        : this.initial_pedal_parameters
                                              .pedal_speed_limit + ' km/h'
                                }`,
                                value: this.initial_pedal_parameters
                                    .pedal_speed_limit,
                            },
                            { label: '25 km/h (EU region)', value: 25 },
                            { label: '32 km/h (USA region)', value: 32 },
                            {
                                label: 'By limit in display module',
                                value: SpeedLimitByDisplay,
                            },
                        ]}
                        onChange={(e) => {
                            this.setState({
                                pedal_speed_limit: e.target.value,
                            });
                        }}
                        value={pedal_speed_limit}
                        optionType="button"
                        buttonStyle="solid"
                    />
                ),
            },
            {
                key: 'signals_before_assist',
                label: 'Signals before assist (Start Degree, Signal No.)',
                children: (
                    <Radio.Group
                        options={[
                            {
                                label: `Leave old value - ${
                                    PedalSensorSignals[pedal_type] *
                                    this.initial_pedal_parameters
                                        .pedal_signals_before_start
                                }°`,
                                value: this.initial_pedal_parameters
                                    .pedal_signals_before_start,
                            },
                            {
                                label: '90°',
                                value: PedalSensorSignals[pedal_type] / 4,
                            },
                            {
                                label: '180°',
                                value: PedalSensorSignals[pedal_type] / 2,
                            },
                            {
                                label: '270°',
                                value:
                                    270 /
                                    (360 / PedalSensorSignals[pedal_type]),
                            },
                        ]}
                        onChange={(e) => {
                            this.setState({
                                pedal_signals_before_start: e.target.value,
                            });
                        }}
                        value={pedal_signals_before_start}
                        optionType="button"
                        buttonStyle="solid"
                        disabled={pedal_type < 1 || pedal_type > 3}
                    />
                ),
            },
            {
                key: 'time_before_end_of_assist',
                label: (
                    <>
                        Time before end of assist (Time Of Stop, Stop Delay)
                        <br />
                        TODO replace with constants ot calculator
                    </>
                ),
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
        ];
    }

    getThrottleItems(): DescriptionsProps['items'] {
        const {
            throttle_start_voltage,
            throttle_end_voltage,
            throttle_mode,
            throttle_speed_limit,
        } = this.state;
        return [
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
                key: 'throttle_speed_limit',
                label: 'Throttle speed limit',
                children: (
                    <Radio.Group
                        options={[
                            { label: '25 km/h', value: 25 },
                            { label: '32 km/h', value: 32 },
                            {
                                label: 'By limit in display module',
                                value: SpeedLimitByDisplay,
                            },
                        ]}
                        onChange={(e) => {
                            this.setState({
                                throttle_speed_limit: e.target.value,
                            });
                        }}
                        value={throttle_speed_limit}
                        optionType="button"
                        buttonStyle="solid"
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
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Simplified Settings
                </Typography.Title>
                <br />
                <br />
                <Descriptions
                    bordered
                    title="Info"
                    items={this.getInfoItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
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
                                    const { assist_profiles } = this.state;
                                    assist_profiles[record.assist_level] = {
                                        current_limit: e,
                                        speed_limit:
                                            assist_profiles[record.assist_level]
                                                .speed_limit,
                                    };
                                    this.setState({
                                        assist_profiles,
                                    });
                                }}
                                disabled={record.assist_level == 0}
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
                                    const { assist_profiles } = this.state;
                                    assist_profiles[record.assist_level] = {
                                        current_limit:
                                            assist_profiles[record.assist_level]
                                                .current_limit,
                                        speed_limit: e,
                                    };
                                    this.setState({
                                        assist_profiles,
                                    });
                                }}
                                disabled={record.assist_level == 0}
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
                    title="Throttle TODO hide under button"
                    items={this.getThrottleItems()}
                    column={1}
                />
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

export default BafangUartMotorSettingsSimplifiedView;
