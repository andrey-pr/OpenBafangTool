import React from 'react';
import {
    Typography,
    Descriptions,
    FloatButton,
    message,
    Radio,
    Switch,
    Popconfirm,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../../../../device/high-level/BafangUartMotor';
import {
    BafangUartMotorBasicParameters,
    BafangUartMotorInfo,
    BafangUartMotorPedalParameters,
    ParameterNames,
    PedalSensorSignals,
    SimplifiedPedalSpeedLimitOptions,
    SpeedLimitByDisplay,
} from '../../../../../types/BafangUartMotorTypes';
import { lowVoltageLimits } from '../../../../../constants/parameter_limits';
import ParameterInputComponent from '../../../../components/ParameterInput';
import {
    generateEditableNumberListItemWithWarning,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import AssistLevelTableComponent from '../../../../components/AssistLevelTableComponent';
import SelectParameterComponent from '../../../../components/SelectParameterComponent';
import i18n from '../../../../../i18n/i18n';

const { Title } = Typography;

type SettingsProps = {
    connection: BafangUartMotor;
};

type SettingsState = BafangUartMotorInfo &
    BafangUartMotorBasicParameters &
    BafangUartMotorPedalParameters & {
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

    private packages_written: number;

    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.initial_info = connection.getInfo();
        this.initial_basic_parameters = connection.getBasicParameters();
        this.initial_pedal_parameters = connection.getPedalParameters();
        this.packages_written = 0;
        this.state = {
            ...this.initial_info,
            ...this.initial_basic_parameters,
            ...this.initial_pedal_parameters,
            lastUpdateTime: 0,
        };
        this.getInfoItems = this.getInfoItems.bind(this);
        this.getElectricalParameterItems =
            this.getElectricalParameterItems.bind(this);
        this.getPhysicalParameterItems =
            this.getPhysicalParameterItems.bind(this);
        this.getDriveParameterItems = this.getDriveParameterItems.bind(this);
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
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                info.serial_number,
                i18n.t('serial_number_warning'),
            ),
            generateSimpleStringListItem(i18n.t('voltage'), info.voltage),
            generateSimpleStringListItem(
                i18n.t('max_current'),
                info.max_current,
                i18n.t('max_current_description'),
            ),
        ];
    }

    getElectricalParameterItems(): DescriptionsProps['items'] {
        const { voltage, low_battery_protection } = this.state;

        return [
            {
                key: 'low_voltage_protection',
                label: (
                    <>
                        {i18n.t('battery_low_limit')}
                        <br />
                        <br />
                        <Typography.Text italic>
                            {i18n.t('battery_low_limit_description')}
                        </Typography.Text>
                    </>
                ),
                children: (
                    <ParameterInputComponent
                        value={low_battery_protection}
                        unit="V"
                        min={lowVoltageLimits[voltage].min}
                        max={lowVoltageLimits[voltage].max}
                        onNewValue={(e) => {
                            this.setState({
                                low_battery_protection: e,
                            });
                        }}
                    />
                ),
            },
        ];
    }

    getPhysicalParameterItems(): DescriptionsProps['items'] {
        return [
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
                        {i18n.t('pedal_speed_limit')}
                        <br />
                        <br />
                        <Typography.Text italic>
                            {i18n.t('pedal_speed_limit_description')}
                        </Typography.Text>
                    </>
                ),
                children: (
                    <SelectParameterComponent
                        value={pedal_speed_limit}
                        options={[
                            {
                                value: this.initial_pedal_parameters
                                    .pedal_speed_limit,
                                label: `${i18n.t('leave_old_value')} - 
                                        ${
                                            this.initial_pedal_parameters
                                                .pedal_speed_limit ===
                                            SpeedLimitByDisplay
                                                ? i18n.t('by_display')
                                                : i18n.t('x_km/h', {
                                                      speed: this
                                                          .initial_pedal_parameters
                                                          .pedal_speed_limit,
                                                  })
                                        }`,
                            },
                            ...SimplifiedPedalSpeedLimitOptions,
                        ]}
                        onChange={(e) => {
                            this.setState({
                                pedal_speed_limit: e as number,
                            });
                        }}
                    />
                ),
                contentStyle: { width: '50%' },
            },
            {
                key: 'signals_before_assist',
                label: (
                    <>
                        {i18n.t('start_degree')}
                        <br />
                        <br />
                        <Typography.Text italic>
                            {i18n.t('start_degree_description')}
                        </Typography.Text>
                    </>
                ),
                children: (
                    <Radio.Group
                        onChange={(e) => {
                            this.setState({
                                pedal_signals_before_start: e.target.value,
                            });
                        }}
                        value={pedal_signals_before_start}
                        disabled={pedal_type < 1 || pedal_type > 3}
                    >
                        <Radio
                            value={
                                this.initial_pedal_parameters
                                    .pedal_signals_before_start
                            }
                        >
                            {i18n.t('leave_old_value')} -&nbsp;
                            {(360 / PedalSensorSignals[pedal_type]) *
                                this.initial_pedal_parameters
                                    .pedal_signals_before_start}
                            °
                        </Radio>
                        <Radio value={PedalSensorSignals[pedal_type] / 4}>
                            90°
                        </Radio>
                        <Radio value={PedalSensorSignals[pedal_type] / 2}>
                            180°
                        </Radio>
                        <Radio
                            value={270 / (360 / PedalSensorSignals[pedal_type])}
                        >
                            270°
                        </Radio>
                    </Radio.Group>
                ),
                contentStyle: { width: '50%' },
            },
            {
                key: 'time_before_end_of_assist',
                label: (
                    <>
                        {i18n.t('stop_delay')}
                        <br />
                        <br />
                        <Typography.Text italic>
                            {i18n.t('stop_delay_simplified_description')}
                        </Typography.Text>
                    </>
                ),
                children: (
                    <Radio.Group
                        onChange={(e) => {
                            this.setState({
                                pedal_time_to_stop:
                                    e.target.value - (e.target.value % 10),
                            });
                        }}
                        value={pedal_time_to_stop}
                    >
                        <Radio
                            value={
                                this.initial_pedal_parameters.pedal_time_to_stop
                            }
                        >
                            {i18n.t('leave_old_value')} -&nbsp;
                            {this.initial_pedal_parameters.pedal_time_to_stop}
                            {i18n.t('ms')}
                        </Radio>
                        <Radio value={50}>50{i18n.t('ms')}</Radio>
                        <Radio value={100}>100{i18n.t('ms')}</Radio>
                        <Radio value={150}>150{i18n.t('ms')}</Radio>
                        <Radio value={200}>200{i18n.t('ms')}</Radio>
                        <Radio value={250}>250{i18n.t('ms')}</Radio>
                    </Radio.Group>
                ),
                contentStyle: { width: '50%' },
            },
        ];
    }

    updateData(): void {
        const { connection } = this.props;
        this.initial_info = connection.getInfo();
        this.initial_basic_parameters = connection.getBasicParameters();
        this.initial_pedal_parameters = connection.getPedalParameters();
        this.setState({
            ...this.initial_info,
            ...this.initial_basic_parameters,
            ...this.initial_pedal_parameters,
            lastUpdateTime: Date.now(),
        });
        console.log(
            'updated',
            this.initial_info,
            this.initial_basic_parameters,
            this.initial_pedal_parameters,
        );
    }

    saveParameters(): void {
        const { connection } = this.props;
        const info: BafangUartMotorInfo = this.state as BafangUartMotorInfo;
        const basic_parameters: BafangUartMotorBasicParameters = this
            .state as BafangUartMotorBasicParameters;
        const pedal_parameters: BafangUartMotorPedalParameters = this
            .state as BafangUartMotorPedalParameters;
        connection.setSerialNumber(info.serial_number);
        connection.setBasicParameters(basic_parameters);
        connection.setPedalParameters(pedal_parameters);
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
                    {i18n.t('uart_motor_parameters_title')}
                </Typography.Title>
                <br />
                <br />
                <Descriptions
                    bordered
                    title={i18n.t('info')}
                    items={this.getInfoItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
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

export default BafangUartMotorSettingsSimplifiedView;
