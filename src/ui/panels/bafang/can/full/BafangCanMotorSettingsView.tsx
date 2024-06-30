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
    TorqueProfile,
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
import {
    BafangAssistProfile,
    BooleanOptions,
} from '../../../../../types/common';
import TorqueTableComponent from '../../../../components/TorqueTableComponent';
import { WheelDiameterTable } from '../../../../../constants/BafangCanConstants';
import { updateField } from '../../../../../utils/utils';

const { Text } = Typography;

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = {
    parameter1: BafangCanControllerParameter1 | null;
    torque_profiles: TorqueProfile[] | null;
    parameter3: BafangCanControllerSpeedParameters | null;
    realtime0: BafangCanControllerRealtime0 | null;
    realtime1: BafangCanControllerRealtime1 | null;
    current_limit: number | null; // This cludge made as temporary solution to avoid problem with updating of whole component when one field is changed
    overvoltage: number | null;
    undervoltage_under_load: number | null;
    undervoltage: number | null;
    battery_capacity: number | null;
    full_capacity_range: number | null;
    speedmeter_magnets_number: number | null;
    lamps_always_on: boolean | null;
    start_current: number | null;
    current_loading_time: number | null;
    current_shedding_time: number | null;
    pedal_sensor_type: PedalSensorType | null;
    throttle_start_voltage: number | null;
    throttle_max_voltage: number | null;
    assist_levels: BafangAssistProfile[] | null;
    hardware_version: string | null;
    software_version: string | null;
    model_number: string | null;
    serial_number: string | null;
    manufacturer: string | null;
    position_sensor_calibration_dialog: boolean;
};

/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    // TODO add torque calibration button
    // TODO fix parameter changing
    SettingsProps,
    SettingsState
> {
    private writingInProgress: boolean = false;

    constructor(props: SettingsProps) {
        super(props);
        const { controller } = this.props.connection;
        this.state = {
            parameter1: controller.parameter1,
            torque_profiles: controller.parameter2
                ? controller.parameter2.torque_profiles
                : null,
            parameter3: controller.parameter3,
            current_limit: controller.parameter1
                ? controller.parameter1.current_limit
                : null,
            overvoltage: controller.parameter1
                ? controller.parameter1.overvoltage
                : null,
            undervoltage_under_load: controller.parameter1
                ? controller.parameter1.undervoltage_under_load
                : null,
            undervoltage: controller.parameter1
                ? controller.parameter1.undervoltage
                : null,
            battery_capacity: controller.parameter1
                ? controller.parameter1.battery_capacity
                : null,
            full_capacity_range: controller.parameter1
                ? controller.parameter1.full_capacity_range
                : null,
            speedmeter_magnets_number: controller.parameter1
                ? controller.parameter1.speedmeter_magnets_number
                : null,
            lamps_always_on: controller.parameter1
                ? controller.parameter1.lamps_always_on
                : null,
            start_current: controller.parameter1
                ? controller.parameter1.start_current
                : null,
            current_loading_time: controller.parameter1
                ? controller.parameter1.current_loading_time
                : null,
            current_shedding_time: controller.parameter1
                ? controller.parameter1.current_shedding_time
                : null,
            pedal_sensor_type: controller.parameter1
                ? controller.parameter1.pedal_sensor_type
                : null,
            throttle_start_voltage: controller.parameter1
                ? controller.parameter1.throttle_start_voltage
                : null,
            throttle_max_voltage: controller.parameter1
                ? controller.parameter1.throttle_max_voltage
                : null,
            assist_levels: controller.parameter1
                ? controller.parameter1.assist_levels
                : null,
            realtime0: controller.realtimeData0,
            realtime1: controller.realtimeData1,
            hardware_version: controller.hardwareVersion,
            software_version: controller.softwareVersion,
            model_number: controller.modelNumber,
            serial_number: controller.serialNumber,
            manufacturer: controller.manufacturer,
            position_sensor_calibration_dialog: false,
        };
        this.getElectricItems = this.getElectricItems.bind(this);
        this.getBatteryItems = this.getBatteryItems.bind(this);
        this.getMechanicalItems = this.getMechanicalItems.bind(this);
        this.getDrivingItems = this.getDrivingItems.bind(this);
        this.getThrottleItems = this.getThrottleItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        controller.emitter.on('data-hv', (hardware_version: string) =>
            this.setState({ hardware_version }),
        );
        controller.emitter.on('data-sv', (software_version: string) =>
            this.setState({ software_version }),
        );
        controller.emitter.on('data-mn', (model_number: string) =>
            this.setState({ model_number }),
        );
        controller.emitter.on('data-sn', (serial_number: string) =>
            this.setState({ serial_number }),
        );
        controller.emitter.on('data-m', (manufacturer: string) =>
            this.setState({ manufacturer }),
        );
        controller.emitter.on(
            'data-p1',
            (parameter1: BafangCanControllerParameter1) =>
                this.setState({
                    parameter1,
                    current_limit: parameter1.current_limit,
                    overvoltage: parameter1.overvoltage,
                    undervoltage_under_load: parameter1.undervoltage_under_load,
                    undervoltage: parameter1.undervoltage,
                    battery_capacity: parameter1.battery_capacity,
                    full_capacity_range: parameter1.full_capacity_range,
                    speedmeter_magnets_number:
                        parameter1.speedmeter_magnets_number,
                    lamps_always_on: parameter1.lamps_always_on,
                    start_current: parameter1.start_current,
                    current_loading_time: parameter1.current_loading_time,
                    current_shedding_time: parameter1.current_shedding_time,
                    pedal_sensor_type: parameter1.pedal_sensor_type,
                    throttle_start_voltage: parameter1.throttle_start_voltage,
                    throttle_max_voltage: parameter1.throttle_max_voltage,
                    assist_levels: parameter1.assist_levels,
                }),
        );
        controller.emitter.on('data-p2', (e: BafangCanControllerParameter2) =>
            this.setState({ torque_profiles: e.torque_profiles }),
        );
        controller.emitter.on(
            'data-p3',
            (parameter3: BafangCanControllerSpeedParameters) =>
                this.setState({ parameter3 }),
        );
        controller.emitter.on(
            'data-r0',
            (realtime0: BafangCanControllerRealtime0) =>
                this.setState({ realtime0 }),
        );
        controller.emitter.on(
            'data-r1',
            (realtime1: BafangCanControllerRealtime1) =>
                this.setState({ realtime1 }),
        );
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
                this.state.current_limit,
                (current_limit: number) =>
                    this.setState({
                        current_limit,
                    }),
                'Be very careful with this parameter! Too big value may burn engine!',
                'A',
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItem(
                'High voltage limit',
                this.state.overvoltage,
                (overvoltage: number) =>
                    this.setState({
                        overvoltage,
                    }),
                'Controller will show overvoltage error when this limit is reached',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Low voltage limit under load',
                this.state.undervoltage_under_load,
                (undervoltage_under_load: number) =>
                    this.setState({
                        undervoltage_under_load,
                    }),
                'Controller will stop motor when this limit is reached under load (during riding) to protect battery from overdischarge',
                'V',
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                'Idle low voltage limit',
                this.state.undervoltage,
                (undervoltage: number) =>
                    this.setState({
                        undervoltage,
                    }),
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
                this.state.battery_capacity,
                (battery_capacity: number) =>
                    this.setState({
                        battery_capacity,
                    }),
                'mAh',
                1,
                65000,
            ),
            generateEditableNumberListItem(
                'Expected range on full charge',
                this.state.full_capacity_range,
                (full_capacity_range: number) =>
                    this.setState({
                        full_capacity_range,
                    }),
                'Km',
                1,
                255,
            ),
            // generateEditableNumberListItem(
            //     'Max current on low capacity',
            //     parameter1.max_current_on_low_charge,
            //     (max_current_on_low_charge: number) =>
            //         this.setState({ max_current_on_low_charge }),
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
                this.state.speedmeter_magnets_number,
                (speedmeter_magnets_number: number) =>
                    this.setState({
                        speedmeter_magnets_number,
                    }),
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
            //     parameter1.displayless_mode,
            //     (e) =>
            //         this.setState({
            //             displayless_mode: e as boolean,
            //         }),
            // ),
            generateEditableSelectListItem(
                'Lamps always on',
                BooleanOptions,
                this.state.lamps_always_on,
                (e) =>
                    this.setState({
                        lamps_always_on: e as boolean,
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
                this.state.start_current,
                (start_current: number) =>
                    this.setState({
                        start_current,
                    }),
                '%',
                1,
                100,
            ),
            generateEditableNumberListItem(
                // TODO
                'Current loading time',
                this.state.current_loading_time,
                (current_loading_time: number) =>
                    this.setState({
                        current_loading_time,
                    }),
                'S',
                0.1,
                20,
                1,
            ),
            generateEditableNumberListItem(
                // TODO
                'Current shedding time',
                this.state.current_shedding_time,
                (current_shedding_time: number) =>
                    this.setState({
                        current_shedding_time,
                    }),
                'S',
                0.1,
                20,
                1,
            ),
            generateEditableSelectListItem(
                'Motor trigger',
                TriggerTypeOptions,
                this.state.pedal_sensor_type,
                (e) =>
                    this.setState({
                        pedal_sensor_type: e as number,
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
                this.state.throttle_start_voltage,
                (throttle_start_voltage: number) =>
                    this.setState({
                        throttle_start_voltage,
                    }),
                'Voltage from throttle lever on minimum power (not on zero power! on this level engine starts to work)',
                'V',
                1,
                20,
                1,
            ),
            generateAnnotatedEditableNumberListItem(
                'Throttle lever max voltage',
                this.state.throttle_max_voltage,
                (throttle_max_voltage: number) =>
                    this.setState({
                        throttle_max_voltage,
                    }),
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
                            this.setState({
                                parameter3: updateField(
                                    this.state.parameter3,
                                    'speed_limit',
                                    e,
                                ),
                            });
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
                                    parameter3: updateField(
                                        this.state.parameter3,
                                        'wheel_diameter',
                                        wheel_diameter,
                                    ),
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
                            this.setState({
                                parameter3: updateField(
                                    this.state.parameter3,
                                    'circumference',
                                    e,
                                ),
                            });
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
                        manufacturer: e,
                    }),
            ),
        ];
    }

    saveParameters(): void {
        if (this.writingInProgress) return;
        this.writingInProgress = true;
        const { connection } = this.props;
        const { parameter1 } = this.state;
        if (parameter1) {
            if (this.state.current_limit)
                parameter1.current_limit = this.state.current_limit;
            if (this.state.overvoltage)
                parameter1.overvoltage = this.state.overvoltage;
            if (this.state.undervoltage_under_load)
                parameter1.undervoltage_under_load =
                    this.state.undervoltage_under_load;
            if (this.state.undervoltage)
                parameter1.undervoltage = this.state.undervoltage;
            if (this.state.battery_capacity)
                parameter1.battery_capacity = this.state.battery_capacity;
            if (this.state.full_capacity_range)
                parameter1.full_capacity_range = this.state.full_capacity_range;
            if (this.state.speedmeter_magnets_number)
                parameter1.speedmeter_magnets_number =
                    this.state.speedmeter_magnets_number;
            if (this.state.lamps_always_on !== null)
                parameter1.lamps_always_on = this.state.lamps_always_on;
            if (this.state.start_current)
                parameter1.start_current = this.state.start_current;
            if (this.state.current_loading_time)
                parameter1.current_loading_time =
                    this.state.current_loading_time;
            if (this.state.current_shedding_time)
                parameter1.current_shedding_time =
                    this.state.current_shedding_time;
            if (this.state.pedal_sensor_type)
                parameter1.pedal_sensor_type = this.state.pedal_sensor_type;
            if (this.state.throttle_start_voltage)
                parameter1.throttle_start_voltage =
                    this.state.throttle_start_voltage;
            if (this.state.throttle_max_voltage)
                parameter1.throttle_max_voltage =
                    this.state.throttle_max_voltage;
            if (this.state.assist_levels)
                parameter1.assist_levels = this.state.assist_levels;
            connection.controller.parameter1 = parameter1; //TODO
        }
        if (this.state.torque_profiles) {
            connection.controller.parameter2 = {
                torque_profiles: this.state.torque_profiles,
            };
        }
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
                {this.state.assist_levels && (
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
                            assist_profiles={this.state.assist_levels}
                            onChange={(assist_levels) =>
                                this.setState({
                                    assist_levels,
                                })
                            }
                        />
                    </>
                )}
                {!this.state.parameter1 && (
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
                {this.state.torque_profiles && (
                    <>
                        <Title level={5}>Torque sensor-controlled assist</Title>
                        <br />
                        <TorqueTableComponent
                            torque_profiles={this.state.torque_profiles}
                            onChange={(torque_profiles) => {
                                this.setState({
                                    torque_profiles,
                                });
                            }}
                        />
                    </>
                )}
                {!this.state.torque_profiles && (
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
