import React from 'react';
import {
    Typography,
    Descriptions,
    FloatButton,
    message,
    Popconfirm,
    Button,
    Modal,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import {
    SyncOutlined,
    DeliveredProcedureOutlined,
    WarningTwoTone,
} from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanControllerCodes,
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanPedalSensorType,
    BafangCanWheelDiameterTable,
    TriggerTypeOptions,
} from '../../../../../types/BafangCanSystemTypes';
import { NotAvailable, NotLoadedYet } from '../../../../../types/no_data';
import ParameterInputComponent from '../../../components/ParameterInput';
import ParameterSelectComponent from '../../../components/ParameterSelect';
import {
    generateAnnotatedEditableNumberListItem,
    generateEditableNumberListItem,
    generateEditableSelectListItem,
    generateEditableStringListItem,
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import Title from 'antd/es/typography/Title';
import AssistLevelTableComponent from '../../../components/AssistLevelTableComponent';
import { BooleanOptions } from '../../../../../types/common';
import TorqueTableComponent from '../../../components/TorqueTableComponent';

const { Text } = Typography;

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanControllerRealtime &
    BafangCanControllerSpeedParameters &
    BafangCanControllerParameter1 &
    BafangCanControllerParameter2 &
    BafangCanControllerCodes & { position_sensor_calibration_dialog: boolean };

// TODO add redux
/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    // TODO add param2 and torque calibration button
    SettingsProps,
    SettingsState
> {
    private writingInProgress: boolean = false;

    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.controllerSpeedParameters,
            ...connection.controllerCodes,
            ...connection.controllerRealtimeData,
            ...connection.controllerParameter1,
            ...connection.controllerParameter2,
            position_sensor_calibration_dialog: false,
        };
        this.getElectricItems = this.getElectricItems.bind(this);
        this.getBatteryItems = this.getBatteryItems.bind(this);
        this.getMechanicalItems = this.getMechanicalItems.bind(this);
        this.getDrivingItems = this.getDrivingItems.bind(this);
        this.getThrottleItems = this.getThrottleItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.once('controller-speed-data', this.updateData);
        connection.emitter.on('controller-parameter1', this.updateData);
        connection.emitter.on('controller-parameter2', this.updateData);
        connection.emitter.on('controller-codes-data', this.updateData);
        connection.emitter.on('broadcast-data-controller', this.updateData);
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'Remaining capacity',
                this.state.controller_remaining_capacity,
                '%',
            ),
            generateSimpleNumberListItem(
                'Remaining trip distance',
                this.state.controller_remaining_distance,
                'Km',
            ),
            generateSimpleNumberListItem(
                'Last trip distance',
                this.state.controller_single_trip,
                'Km',
            ),
            generateSimpleNumberListItem(
                'Cadence',
                this.state.controller_cadence,
                'RPM',
            ),
            generateSimpleNumberListItem(
                'Torque value',
                this.state.controller_torque,
                'mV',
            ),
            generateSimpleNumberListItem(
                'Voltage',
                this.state.controller_voltage,
                'V',
            ),
            generateSimpleNumberListItem(
                'Controller temperature',
                this.state.controller_temperature,
                'C°',
            ),
            generateSimpleNumberListItem(
                'Motor temperature',
                this.state.controller_motor_temperature,
                'C°',
            ),
            generateSimpleNumberListItem(
                'Current',
                this.state.controller_current,
                'A',
            ),
            generateSimpleNumberListItem(
                'Speed',
                this.state.controller_speed,
                'Km/H',
            ),
        ];
    }

    getElectricItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'System voltage',
                this.state.controller_system_voltage,
                'V',
            ),
            generateAnnotatedEditableNumberListItem(
                'Current limit',
                this.state.controller_current_limit,
                (controller_current_limit: number) =>
                    this.setState({ controller_current_limit }),
                'Be very careful with this parameter! Too big value may burn engine!',
                'A',
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItem(
                'High voltage limit',
                this.state.controller_overvoltage,
                (controller_overvoltage: number) =>
                    this.setState({ controller_overvoltage }),
                'Controller will show overvoltage error when this limit is reached',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Low voltage limit under load',
                this.state.controller_undervoltage_under_load,
                (controller_undervoltage_under_load: number) =>
                    this.setState({ controller_undervoltage_under_load }),
                'Controller will stop motor when this limit is reached under load (during riding) to protect battery from overdischarge',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Idle low voltage limit',
                this.state.controller_undervoltage,
                (controller_undervoltage: number) =>
                    this.setState({ controller_undervoltage }),
                'Controller will not launch motor motor when this limit is reached without load to protect battery from overdischarge',
                'V',
                0,
                256,
            ),
        ];
    }

    getBatteryItems(): DescriptionsProps['items'] {
        return [
            generateEditableNumberListItem(
                'Expected battery capacity',
                this.state.controller_battery_capacity,
                (controller_battery_capacity: number) =>
                    this.setState({ controller_battery_capacity }),
                'mAh',
                1,
                65000,
            ),
            generateEditableNumberListItem(
                'Expected range on full charge',
                this.state.controller_full_capacity_range,
                (controller_full_capacity_range: number) =>
                    this.setState({ controller_full_capacity_range }),
                'Km',
                1,
                255,
            ),
            // generateEditableNumberListItem(
            //     'Max current on low capacity',
            //     this.state.controller_max_current_on_low_charge,
            //     (controller_max_current_on_low_charge: number) =>
            //         this.setState({ controller_max_current_on_low_charge }),
            //     'A',
            //     1,
            //     100,
            // ),
            //TODO add three low charge decay parameters, recovery voltage
        ];
    }

    getMechanicalItems(): DescriptionsProps['items'] {
        const MotorType: { [key: number]: string } = {
            0: 'Hub motor with reducer',
            1: 'Central motor',
            2: 'Direct-drive motor (hud motor without reducer)',
        };
        const TemperatureSensorType: { [key: number]: string } = {
            0: 'No sensor',
            1: '10K',
            2: 'PT1000',
        };
        return [
            generateSimpleNumberListItem(
                'Gear ration',
                this.state.controller_deceleration_ratio,
            ),
            generateSimpleStringListItem(
                'Coaster brake supported',
                this.state.controller_coaster_brake ? 'Yes' : 'No',
            ),
            generateSimpleNumberListItem(
                'Max motor rotation speed',
                this.state.controller_motor_max_rotor_rpm,
                'RPM',
            ),
            generateSimpleNumberListItem(
                'Signals per rotation from cadence sensor',
                this.state.controller_pedal_sensor_signals_per_rotation,
            ),
            generateSimpleStringListItem(
                'Motor type',
                MotorType[this.state.controller_motor_type],
            ),
            generateEditableNumberListItem(
                'Number of magnets on speedmeter',
                this.state.controller_speedmeter_magnets_number,
                (controller_speedmeter_magnets_number: number) =>
                    this.setState({ controller_speedmeter_magnets_number }),
                '',
                1,
                10,
            ),
            generateSimpleStringListItem(
                'Temperature sensor',
                TemperatureSensorType[
                    this.state.controller_temperature_sensor_type
                ],
            ),
            // generateEditableSelectListItem(
            //     'Displayless mode',
            //     BooleanOptions,
            //     this.state.controller_displayless_mode,
            //     (e) =>
            //         this.setState({
            //             controller_displayless_mode: e as boolean,
            //         }),
            // ),
            generateEditableSelectListItem(
                'Lamps always on',
                BooleanOptions,
                this.state.controller_lamps_always_on,
                (e) =>
                    this.setState({
                        controller_lamps_always_on: e as boolean,
                    }),
            ),
        ];
    }

    getDrivingItems(): DescriptionsProps['items'] {
        return [
            generateEditableNumberListItem(
                //TODO
                'Start current',
                this.state.controller_start_current,
                (controller_start_current: number) =>
                    this.setState({ controller_start_current }),
                '%',
                1,
                100,
            ),
            generateEditableNumberListItem(
                //TODO
                'Current loading time',
                this.state.controller_current_loading_time,
                (controller_current_loading_time: number) =>
                    this.setState({ controller_current_loading_time }),
                'S',
                0.1,
                20,
                1,
            ),
            generateEditableNumberListItem(
                //TODO
                'Current shedding time',
                this.state.controller_current_shedding_time,
                (controller_current_shedding_time: number) =>
                    this.setState({ controller_current_shedding_time }),
                'S',
                0.1,
                20,
                1,
            ),
            generateEditableSelectListItem(
                'Motor trigger',
                TriggerTypeOptions,
                this.state.controller_pedal_sensor_type,
                (e) =>
                    this.setState({
                        controller_pedal_sensor_type:
                            e as BafangCanPedalSensorType,
                    }),
            ),
        ];
    }

    getThrottleItems(): DescriptionsProps['items'] {
        return [
            generateAnnotatedEditableNumberListItem(
                'Throttle lever start voltage',
                this.state.controller_throttle_start_voltage,
                (controller_throttle_start_voltage: number) =>
                    this.setState({ controller_throttle_start_voltage }),
                'Voltage from throttle lever on minimum power (not on zero power! on this level engine starts to work)',
                'V',
                1,
                20,
                1,
            ),
            generateAnnotatedEditableNumberListItem(
                'Throttle lever max voltage',
                this.state.controller_throttle_max_voltage,
                (controller_throttle_max_voltage: number) =>
                    this.setState({ controller_throttle_max_voltage }),
                'Voltage from throttle lever on maximum power',
                'V',
                1,
                20,
                1,
            ),
        ];
    }

    getSpeedItems(): DescriptionsProps['items'] {
        const {
            controller_speed_limit,
            controller_wheel_diameter,
            controller_circumference,
        } = this.state;
        return [
            {
                key: 'speed_limit',
                label: (
                    <>
                        {'Speed limit'}
                        <br />
                        <Text italic>
                            {
                                'Its illegal to set speed limit bigger than 25km/h'
                            }
                        </Text>
                    </>
                ),
                children: (
                    <ParameterInputComponent
                        value={controller_speed_limit}
                        unit="km/h"
                        min={1}
                        max={25}
                        disabled={controller_speed_limit > 25}
                        onNewValue={(e) => {
                            this.setState({ controller_speed_limit: e });
                        }}
                    />
                ),
            },
            {
                key: 'wheel_diameter',
                label: (
                    <>
                        {'Wheel diameter'}
                        <br />
                        <Text italic>
                            {
                                'NEVER try to set wrong wheel diameter - its illegal, because it can lead to incorrect speed measurement'
                            }
                        </Text>
                    </>
                ),
                children: (
                    <ParameterSelectComponent
                        value={controller_wheel_diameter.text}
                        options={BafangCanWheelDiameterTable.map(
                            (item) => item.text,
                        )}
                        onNewValue={(value) => {
                            const controller_wheel_diameter =
                                BafangCanWheelDiameterTable.find(
                                    (item) => item.text === value,
                                );
                            if (controller_wheel_diameter)
                                this.setState({
                                    controller_wheel_diameter,
                                });
                        }}
                        doNotBlock
                    />
                ),
            },
            {
                key: 'circumference',
                label: 'Wheel circumference',
                children: (
                    <ParameterInputComponent
                        value={controller_circumference}
                        unit="mm"
                        min={controller_wheel_diameter.minimalCircumference}
                        max={controller_wheel_diameter.maximalCircumference}
                        onNewValue={(e) => {
                            this.setState({ controller_circumference: e });
                        }}
                    />
                ),
            },
        ];
    }

    getCalibrationItems(): DescriptionsProps['items'] {
        return [
            {
                key: 'position_sensor_calibration',
                label: 'Position sensor',
                children: (
                    <Popconfirm
                        title="Position sensor calibration"
                        description={`Are you sure to calibrate position sensor?`}
                        onConfirm={() =>
                            this.setState({
                                position_sensor_calibration_dialog: true,
                            })
                        }
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary">Calibrate</Button>
                    </Popconfirm>
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const { controller_serial_number, controller_manufacturer } =
            this.state;
        return [
            generateSimpleStringListItem(
                'Serial number',
                controller_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.controller_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.controller_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.controller_model_number,
            ),
            generateEditableStringListItem(
                'Manufacturer',
                controller_manufacturer,
                (e) =>
                    this.setState({
                        controller_manufacturer: e,
                    }),
            ),
        ];
    }

    saveParameters(): void {
        if (this.writingInProgress) return;
        this.writingInProgress = true;
        const { connection } = this.props;
        if (connection.isControllerSpeedParametersAvailable) {
            connection.controllerSpeedParameters = this
                .state as BafangCanControllerSpeedParameters;
        }
        connection.controllerCodes = this.state as BafangCanControllerCodes;
        if (connection.isControllerParameter1Available) {
            connection.controllerParameter1 = this
                .state as BafangCanControllerParameter1;
        }
        if (connection.isControllerParameter2Available) {
            connection.controllerParameter2 = this
                .state as BafangCanControllerParameter2;
        }
        connection.saveControllerData();
        message.open({
            key: 'writing',
            type: 'loading',
            content: 'Writing...',
            duration: 60,
        });
        connection.emitter.once(
            'controller-writing-finish',
            (readedSuccessfully, readededUnsuccessfully) => {
                message.open({
                    key: 'writing',
                    type: 'info',
                    content: `Wrote ${readedSuccessfully} parameters succesfully, ${readededUnsuccessfully} not succesfully`,
                    duration: 5,
                });
                this.writingInProgress = false;
            },
        );
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Motor settings
                </Typography.Title>
                <Modal
                    title={
                        <>
                            <WarningTwoTone twoToneColor="red" />
                            {'   WARNING   '}
                            <WarningTwoTone twoToneColor="red" />
                        </>
                    }
                    okText="Continue"
                    cancelText="Cancel"
                    open={this.state.position_sensor_calibration_dialog}
                    onOk={() => {
                        message.open({
                            key: 'position_sensor_calibration',
                            type: 'loading',
                            content: 'Calibrating...',
                            duration: 2,
                        });
                        this.setState({
                            position_sensor_calibration_dialog: false,
                        });
                        this.props.connection
                            .calibratePositionSensor()
                            .then((success) => {})
                            .catch(() => {});
                    }}
                    onCancel={() =>
                        this.setState({
                            position_sensor_calibration_dialog: false,
                        })
                    }
                >
                    <p>During calibration motor will rotate very fast!</p>
                    <p>
                        Remove the chain from the front gear and ensure that
                        bike installed safely and cranks nor gear will not hit
                        anything when rotating!
                    </p>
                </Modal>
                <br />
                <Descriptions
                    bordered
                    title="Real-Time data"
                    items={this.getRealtimeItems()}
                    column={1}
                />
                {connection.isControllerParameter1Available && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Electric parameters"
                            items={this.getElectricItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title="Battery parameters"
                            items={this.getBatteryItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title="Mechanical parameters"
                            items={this.getMechanicalItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title="Driving parameters"
                            items={this.getDrivingItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title="Throttle parameters"
                            items={this.getThrottleItems()}
                            column={1}
                        />
                        <br />
                        <Title level={5}>Assist levels</Title>
                        <br />
                        <AssistLevelTableComponent
                            assist_profiles={
                                this.state.controller_assist_levels
                            }
                            onChange={(controller_assist_levels) =>
                                this.setState({
                                    controller_assist_levels,
                                })
                            }
                        />
                    </>
                )}
                {!connection.isControllerParameter1Available && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Controller does not have available to read and
                                write parameter pack #1
                            </Text>
                        </div>
                    </>
                )}
                {connection.isControllerParameter2Available && (
                    <>
                        <Title level={5}>Torque sensor-controlled assist</Title>
                        <br />
                        <TorqueTableComponent
                            torque_profiles={
                                this.state.controller_torque_profiles
                            }
                            onChange={(controller_torque_profiles) => {
                                this.setState({
                                    controller_torque_profiles,
                                });
                            }}
                        />
                    </>
                )}
                {!connection.isControllerParameter2Available && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Controller does not have available to read and
                                write parameter pack #2
                            </Text>
                        </div>
                    </>
                )}
                {connection.isControllerSpeedParametersAvailable && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Speed settings"
                            items={this.getSpeedItems()}
                            column={1}
                        />
                    </>
                )}
                {!connection.isControllerSpeedParametersAvailable && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Controller does not have available to read and
                                write speed parameter pack
                            </Text>
                        </div>
                    </>
                )}
                <br />
                <Descriptions
                    bordered
                    title="Calibration"
                    items={this.getCalibrationItems()}
                    column={1}
                />
                <br />
                <Descriptions
                    bordered
                    title="Other"
                    items={this.getOtherItems()}
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
                            duration: 60,
                        });
                        connection.emitter.once(
                            'reading-finish',
                            (readedSuccessfully, readededUnsuccessfully) =>
                                message.open({
                                    key: 'loading',
                                    type: 'info',
                                    content: `Loaded ${readedSuccessfully} parameters succesfully, ${readededUnsuccessfully} not succesfully`,
                                    duration: 5,
                                }),
                        );
                    }}
                />
                <FloatButton
                    icon={<DeliveredProcedureOutlined />}
                    type="primary"
                    style={{ right: 24 }}
                    onClick={this.saveParameters}
                />
            </div>
        );
    }
}

export default BafangCanMotorSettingsView;
