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
import Title from 'antd/es/typography/Title';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanControllerParameter1,
    BafangCanControllerParameter2,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanControllerSpeedParameters,
    PedalSensorType,
    TriggerTypeOptions,
} from '../../../../../types/BafangCanSystemTypes';
import ParameterInputComponent from '../../../../components/ParameterInput';
import ParameterSelectComponent from '../../../../components/ParameterSelect';
import {
    generateAnnotatedEditableNumberListItem,
    generateEditableNumberListItem,
    generateEditableSelectListItem,
    generateEditableStringListItem,
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import AssistLevelTableComponent from '../../../../components/AssistLevelTableComponent';
import { BooleanOptions } from '../../../../../types/common';
import TorqueTableComponent from '../../../../components/TorqueTableComponent';
import { WheelDiameterTable } from '../../../../../constants/BafangCanConstants';

const { Text } = Typography;

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = {
    parameter1: BafangCanControllerParameter1 | null;
    parameter2: BafangCanControllerParameter2 | null;
    parameter3: BafangCanControllerSpeedParameters | null;
    realtime0: BafangCanControllerRealtime0 | null;
    realtime1: BafangCanControllerRealtime1 | null;
    hardware_version: string | null;
    software_version: string | null;
    model_number: string | null;
    serial_number: string | null;
    manufacturer: string | null;
    position_sensor_calibration_dialog: boolean;
};

// TODO add redux
/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    // TODO add torque calibration button
    SettingsProps,
    SettingsState
> {
    private writingInProgress: boolean = false;

    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            parameter1: connection.controller.parameter1,
            parameter2: connection.controller.parameter2,
            parameter3: connection.controller.parameter3,
            realtime0: connection.controller.realtimeData0,
            realtime1: connection.controller.realtimeData1,
            hardware_version: connection.controller.hardwareVersion,
            software_version: connection.controller.softwareVersion,
            model_number: connection.controller.modelNumber,
            serial_number: connection.controller.serialNumber,
            manufacturer: connection.controller.manufacturer,
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
        connection.controller.emitter.on(
            'data-hv',
            (hardware_version: string) => this.setState({ hardware_version }),
        );
        connection.controller.emitter.on(
            'data-sv',
            (software_version: string) => this.setState({ software_version }),
        );
        connection.controller.emitter.on('data-mn', (model_number: string) =>
            this.setState({ model_number }),
        );
        connection.controller.emitter.on('data-sn', (serial_number: string) =>
            this.setState({ serial_number }),
        );
        connection.controller.emitter.on('data-m', (manufacturer: string) =>
            this.setState({ manufacturer }),
        );
        connection.controller.emitter.on(
            'data-p1',
            (parameter1: BafangCanControllerParameter1) =>
                this.setState({ parameter1 }),
        );
        connection.controller.emitter.on(
            'data-p2',
            (parameter2: BafangCanControllerParameter2) =>
                this.setState({ parameter2 }),
        );
        connection.controller.emitter.on(
            'data-p3',
            (parameter3: BafangCanControllerSpeedParameters) =>
                this.setState({ parameter3 }),
        );
        connection.controller.emitter.on(
            'data-r0',
            (realtime0: BafangCanControllerRealtime0) =>
                this.setState({ realtime0 }),
        );
        connection.controller.emitter.on(
            'data-r1',
            (realtime1: BafangCanControllerRealtime1) =>
                this.setState({ realtime1 }),
        );
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        let items: DescriptionsProps['items'] = [];
        const { realtime0 } = this.state;
        if (realtime0) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Remaining capacity',
                    realtime0.remaining_capacity,
                    '%',
                ),
                generateSimpleNumberListItem(
                    'Remaining trip distance',
                    realtime0.remaining_distance,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Last trip distance',
                    realtime0.single_trip,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Cadence',
                    realtime0.cadence,
                    'RPM',
                ),
                generateSimpleNumberListItem(
                    'Torque value',
                    realtime0.torque,
                    'mV',
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Remaining capacity',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Remaining trip distance',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Last trip distance',
                    'Not available yet',
                ),
                generateSimpleStringListItem('Cadence', 'Not available yet'),
                generateSimpleStringListItem(
                    'Torque value',
                    'Not available yet',
                ),
            ];
        }
        const { realtime1 } = this.state;
        if (realtime1) {
            items = [
                ...items,
                generateSimpleNumberListItem('Voltage', realtime1.voltage, 'V'),
                generateSimpleNumberListItem(
                    'Controller temperature',
                    realtime1.temperature,
                    'C°',
                ),
                generateSimpleNumberListItem(
                    'Motor temperature',
                    realtime1.motor_temperature,
                    'C°',
                ),
                generateSimpleNumberListItem('Current', realtime1.current, 'A'),
                generateSimpleNumberListItem('Speed', realtime1.speed, 'Km/H'),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem('Voltage', 'Not available yet'),
                generateSimpleStringListItem(
                    'Controller temperature',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Motor temperature',
                    'Not available yet',
                ),
                generateSimpleStringListItem('Current', 'Not available yet'),
                generateSimpleStringListItem('Speed', 'Not available yet'),
            ];
        }
        return items;
    }

    getElectricItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateSimpleNumberListItem(
                'System voltage',
                parameter1.system_voltage,
                'V',
            ),
            generateAnnotatedEditableNumberListItem(
                'Current limit',
                parameter1.current_limit,
                (controller_current_limit: number) =>
                    this.setState({ controller_current_limit }),
                'Be very careful with this parameter! Too big value may burn engine!',
                'A',
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItem(
                'High voltage limit',
                parameter1.overvoltage,
                (controller_overvoltage: number) =>
                    this.setState({ controller_overvoltage }),
                'Controller will show overvoltage error when this limit is reached',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Low voltage limit under load',
                parameter1.undervoltage_under_load,
                (controller_undervoltage_under_load: number) =>
                    this.setState({ controller_undervoltage_under_load }),
                'Controller will stop motor when this limit is reached under load (during riding) to protect battery from overdischarge',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Idle low voltage limit',
                parameter1.undervoltage,
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
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateEditableNumberListItem(
                'Expected battery capacity',
                parameter1.battery_capacity,
                (controller_battery_capacity: number) =>
                    this.setState({ controller_battery_capacity }),
                'mAh',
                1,
                65000,
            ),
            generateEditableNumberListItem(
                'Expected range on full charge',
                parameter1.full_capacity_range,
                (controller_full_capacity_range: number) =>
                    this.setState({ controller_full_capacity_range }),
                'Km',
                1,
                255,
            ),
            // generateEditableNumberListItem(
            //     'Max current on low capacity',
            //     parameter1.controller_max_current_on_low_charge,
            //     (controller_max_current_on_low_charge: number) =>
            //         this.setState({ controller_max_current_on_low_charge }),
            //     'A',
            //     1,
            //     100,
            // ),
            // TODO add three low charge decay parameters, recovery voltage
        ];
    }

    getMechanicalItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
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
                parameter1.deceleration_ratio,
            ),
            generateSimpleStringListItem(
                'Coaster brake supported',
                parameter1.coaster_brake ? 'Yes' : 'No',
            ),
            generateSimpleNumberListItem(
                'Max motor rotation speed',
                parameter1.motor_max_rotor_rpm,
                'RPM',
            ),
            generateSimpleNumberListItem(
                'Signals per rotation from cadence sensor',
                parameter1.pedal_sensor_signals_per_rotation,
            ),
            generateSimpleStringListItem(
                'Motor type',
                MotorType[parameter1.motor_type],
            ),
            generateEditableNumberListItem(
                'Number of magnets on speedmeter',
                parameter1.speedmeter_magnets_number,
                (controller_speedmeter_magnets_number: number) =>
                    this.setState({ controller_speedmeter_magnets_number }),
                '',
                1,
                10,
            ),
            generateSimpleStringListItem(
                'Temperature sensor',
                TemperatureSensorType[parameter1.temperature_sensor_type],
            ),
            // generateEditableSelectListItem(
            //     'Displayless mode',
            //     BooleanOptions,
            //     parameter1.controller_displayless_mode,
            //     (e) =>
            //         this.setState({
            //             controller_displayless_mode: e as boolean,
            //         }),
            // ),
            generateEditableSelectListItem(
                'Lamps always on',
                BooleanOptions,
                parameter1.lamps_always_on,
                (e) =>
                    this.setState({
                        controller_lamps_always_on: e as boolean,
                    }),
            ),
        ];
    }

    getDrivingItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateEditableNumberListItem(
                // TODO
                'Start current',
                parameter1.start_current,
                (controller_start_current: number) =>
                    this.setState({ controller_start_current }),
                '%',
                1,
                100,
            ),
            generateEditableNumberListItem(
                // TODO
                'Current loading time',
                parameter1.current_loading_time,
                (controller_current_loading_time: number) =>
                    this.setState({ controller_current_loading_time }),
                'S',
                0.1,
                20,
                1,
            ),
            generateEditableNumberListItem(
                // TODO
                'Current shedding time',
                parameter1.current_shedding_time,
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
                parameter1.pedal_sensor_type,
                (e) =>
                    this.setState({
                        controller_pedal_sensor_type: e as PedalSensorType,
                    }),
            ),
        ];
    }

    getThrottleItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateAnnotatedEditableNumberListItem(
                'Throttle lever start voltage',
                parameter1.throttle_start_voltage,
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
                parameter1.throttle_max_voltage,
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
        const { parameter3 } = this.state;
        if (!parameter3) return [];
        return [
            {
                key: 'speed_limit',
                label: (
                    <>
                        Speed limit
                        <br />
                        <Text italic>
                            Its illegal to set speed limit bigger than 25km/h
                        </Text>
                    </>
                ),
                children: (
                    <ParameterInputComponent
                        value={parameter3.speed_limit}
                        unit="km/h"
                        min={1}
                        max={25}
                        disabled={parameter3.speed_limit > 25}
                        onNewValue={(e) => {
                            this.setState({ speed_limit: e });
                        }}
                    />
                ),
            },
            {
                key: 'wheel_diameter',
                label: (
                    <>
                        Wheel diameter
                        <br />
                        <Text italic>
                            NEVER try to set wrong wheel diameter - its illegal,
                            because it can lead to incorrect speed measurement
                        </Text>
                    </>
                ),
                children: (
                    <ParameterSelectComponent
                        value={parameter3.wheel_diameter.text}
                        options={WheelDiameterTable.map((item) => item.text)}
                        onNewValue={(value) => {
                            const wheel_diameter = WheelDiameterTable.find(
                                (item) => item.text === value,
                            );
                            if (wheel_diameter)
                                this.setState({
                                    wheel_diameter,
                                });
                        }}
                    />
                ),
            },
            {
                key: 'circumference',
                label: 'Wheel circumference',
                children: (
                    <ParameterInputComponent
                        value={parameter3.circumference}
                        unit="mm"
                        min={parameter3.wheel_diameter.minimalCircumference}
                        max={parameter3.wheel_diameter.maximalCircumference}
                        onNewValue={(e) => {
                            this.setState({ circumference: e });
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
                        description="Are you sure to calibrate position sensor?"
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
        return [
            generateSimpleStringListItem(
                'Serial number',
                this.state.serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.model_number,
            ),
            generateEditableStringListItem(
                'Manufacturer',
                this.state.manufacturer,
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
        connection.controller.parameter1 = this.state.parameter1;
        connection.controller.parameter2 = this.state.parameter2;
        connection.controller.parameter3 = this.state.parameter3;
        connection.controller.manufacturer = this.state.manufacturer;
        connection.controller.saveData();
        message.open({
            key: 'writing',
            type: 'loading',
            content: 'Writing...',
            duration: 60,
        });
        connection.controller.emitter.once(
            'write-finish',
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
                        this.props.connection.controller
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
                {this.state.parameter1 && (
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
                                this.state.parameter1.assist_levels
                            }
                            onChange={(controller_assist_levels) =>
                                this.setState({
                                    controller_assist_levels,
                                })
                            }
                        />
                    </>
                )}
                {!connection.controller.parameter1 && (
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
                {this.state.parameter2 && (
                    <>
                        <Title level={5}>Torque sensor-controlled assist</Title>
                        <br />
                        <TorqueTableComponent
                            torque_profiles={
                                this.state.parameter2.torque_profiles
                            }
                            onChange={(torque_profiles) => {
                                this.setState({
                                    torque_profiles,
                                });
                            }}
                        />
                    </>
                )}
                {!connection.controller.parameter2 && (
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
                {connection.controller.parameter3 && (
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
                {!connection.controller.parameter3 && (
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
                        connection.controller.loadData();
                        message.open({
                            key: 'loading',
                            type: 'loading',
                            content: 'Loading...',
                            duration: 60,
                        });
                        connection.controller.emitter.once(
                            'read-finish',
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
