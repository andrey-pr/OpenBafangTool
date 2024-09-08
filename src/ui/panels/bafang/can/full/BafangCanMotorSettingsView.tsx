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
import i18n from '../../../../../i18n/i18n';

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
    walk_assist_speed: number | null;
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
            walk_assist_speed: controller.parameter1
                ? controller.parameter1.walk_assist_speed
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
                    walk_assist_speed: parameter1.walk_assist_speed,
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
                    i18n.t('remaining_capacity'),
                    realtime0.remaining_capacity,
                    '%',
                ),
                generateSimpleNumberListItem(
                    i18n.t('remaining_trip_distance'),
                    realtime0.remaining_distance,
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('last_trip_distance'),
                    realtime0.single_trip,
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('cadence'),
                    realtime0.cadence,
                    i18n.t('rpm'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('torque_value'),
                    realtime0.torque,
                    i18n.t('mv'),
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    i18n.t('remaining_capacity'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('remaining_trip_distance'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('last_trip_distance'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('cadence'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('torque_value'),
                    i18n.t('parameter_not_available_yet'),
                ),
            ];
        }
        const { realtime1 } = this.state;
        if (realtime1) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    i18n.t('voltage'),
                    realtime1.voltage,
                    i18n.t('v'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('controller_temperature'),
                    realtime1.temperature,
                    i18n.t('c_degree'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('motor_temperature'),
                    realtime1.motor_temperature,
                    i18n.t('c_degree'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('current'),
                    realtime1.current,
                    i18n.t('a'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('speed'),
                    realtime1.speed,
                    i18n.t('km/h'),
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    i18n.t('voltage'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('controller_temperature'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('motor_temperature'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('current'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('speed'),
                    i18n.t('parameter_not_available_yet'),
                ),
            ];
        }
        return items;
    }

    getElectricItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateSimpleNumberListItem(
                i18n.t('system_voltage'),
                parameter1.system_voltage,
                i18n.t('v'),
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('current_limit'),
                this.state.current_limit,
                (current_limit: number) =>
                    this.setState({
                        current_limit,
                    }),
                i18n.t('current_limit_description'),
                i18n.t('a'),
                1,
                100,
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('high_voltage_limit'),
                this.state.overvoltage,
                (overvoltage: number) =>
                    this.setState({
                        overvoltage,
                    }),
                i18n.t('high_voltage_limit_description'),
                i18n.t('v'),
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('low_voltage_limit_under_load'),
                this.state.undervoltage_under_load,
                (undervoltage_under_load: number) =>
                    this.setState({
                        undervoltage_under_load,
                    }),
                i18n.t('low_voltage_limit_under_load_description'),
                i18n.t('v'),
                0,
                256,
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('idle_low_voltage_limit'),
                this.state.undervoltage,
                (undervoltage: number) =>
                    this.setState({
                        undervoltage,
                    }),
                i18n.t('idle_low_voltage_limit_description'),
                i18n.t('v'),
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
                i18n.t('nominal_battery_capacity'),
                this.state.battery_capacity,
                (battery_capacity: number) =>
                    this.setState({
                        battery_capacity,
                    }),
                i18n.t('mah'),
                1,
                65000,
            ),
            generateEditableNumberListItem(
                i18n.t('expected_full_charge_range'),
                this.state.full_capacity_range,
                (full_capacity_range: number) =>
                    this.setState({
                        full_capacity_range,
                    }),
                i18n.t('km'),
                1,
                255,
            ),
            // generateEditableNumberListItem(
            //     'Max current on low capacity',
            //     parameter1.max_current_on_low_charge,
            //     (max_current_on_low_charge: number) =>
            //         this.setState({ max_current_on_low_charge }),
            //     i18n.t('a'),
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
            0: i18n.t('hub_motor_with_reducer'),
            1: i18n.t('central_motor'),
            2: i18n.t('hub_motor_without_reducer'),
        };
        const TemperatureSensorType: { [key: number]: string } = {
            0: i18n.t('no_sensor'),
            1: i18n.t('thermistor_10k'),
            2: i18n.t('thermocouple_pt1000'),
        };
        return [
            generateSimpleNumberListItem(
                i18n.t('gear_ratio'),
                parameter1.deceleration_ratio,
            ),
            generateSimpleStringListItem(
                i18n.t('coaster_brake_supported'),
                parameter1.coaster_brake ? i18n.t('yes') : i18n.t('no'),
            ),
            generateSimpleNumberListItem(
                i18n.t('max_motor_rpm'),
                parameter1.motor_max_rotor_rpm,
                i18n.t('rpm'),
            ),
            generateSimpleNumberListItem(
                i18n.t('cadence_sensor_signal_number'),
                parameter1.pedal_sensor_signals_per_rotation,
            ),
            generateSimpleStringListItem(
                i18n.t('motor_type'),
                MotorType[parameter1.motor_type],
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('speed_sensor_signal_number'),
                this.state.speedmeter_magnets_number,
                (speedmeter_magnets_number: number) =>
                    this.setState({
                        speedmeter_magnets_number,
                    }),
                'NEVER try to set wrong magnet number - its illegal, because it will lead to incorrect speed measurement',
                '',
                1,
                10,
            ),
            generateSimpleStringListItem(
                i18n.t('temperature_sensor'),
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
                i18n.t('lamps_always_on'),
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
                i18n.t('start_current'),
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
                i18n.t('current_loading_time'),
                this.state.current_loading_time,
                (current_loading_time: number) =>
                    this.setState({
                        current_loading_time,
                    }),
                i18n.t('s'),
                0.1,
                20,
                1,
            ),
            generateEditableNumberListItem(
                // TODO
                i18n.t('current_shedding_time'),
                this.state.current_shedding_time,
                (current_shedding_time: number) =>
                    this.setState({
                        current_shedding_time,
                    }),
                i18n.t('s'),
                0.1,
                20,
                1,
            ),
            generateEditableSelectListItem(
                i18n.t('motor_trigger'),
                TriggerTypeOptions,
                this.state.pedal_sensor_type,
                (e) =>
                    this.setState({
                        pedal_sensor_type: e as number,
                    }),
            ),
            generateEditableNumberListItem(
                // TODO
                'Walk assist speed',
                this.state.walk_assist_speed,
                (walk_assist_speed: number) =>
                    this.setState({
                        walk_assist_speed,
                    }),
                'Km/H',
                1,
                6,
                1,
            ),
        ];
    }

    getThrottleItems(): DescriptionsProps['items'] {
        const { parameter1 } = this.state;
        if (!parameter1) return [];
        return [
            generateAnnotatedEditableNumberListItem(
                i18n.t('throttle_start_voltage'),
                this.state.throttle_start_voltage,
                (throttle_start_voltage: number) =>
                    this.setState({
                        throttle_start_voltage,
                    }),
                i18n.t('throttle_start_voltage_description'),
                i18n.t('v'),
                1,
                20,
                1,
            ),
            generateAnnotatedEditableNumberListItem(
                i18n.t('throttle_max_voltage'),
                this.state.throttle_max_voltage,
                (throttle_max_voltage: number) =>
                    this.setState({
                        throttle_max_voltage,
                    }),
                i18n.t('throttle_max_voltage_description'),
                i18n.t('v'),
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
                        {i18n.t('speed_limit')}
                        <br />
                        <Text italic>{i18n.t('speed_limit_description')}</Text>
                    </>
                ),
                children: (
                    <ParameterInputComponent
                        value={parameter3.speed_limit}
                        unit={i18n.t('km/h')}
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
                        {i18n.t('wheel_diameter')}
                        <br />
                        <Text italic>
                            {i18n.t('wheel_diameter_description')}
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
                label: i18n.t('circumference'),
                children: (
                    <ParameterInputComponent
                        value={parameter3.circumference}
                        unit={i18n.t('mm')}
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
                label: i18n.t('position_sensor'),
                children: (
                    <Popconfirm
                        title={i18n.t('position_sensor_calibration_title')}
                        description={i18n.t(
                            'position_sensor_calibration_confirm',
                        )}
                        onConfirm={() =>
                            this.setState({
                                position_sensor_calibration_dialog: true,
                            })
                        }
                        okText={i18n.t('yes')}
                        cancelText={i18n.t('no')}
                    >
                        <Button type="primary">{i18n.t('calibrate')}</Button>
                    </Popconfirm>
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.serial_number,
                i18n.t('serial_number_warning'),
            ),
            generateSimpleStringListItem(
                i18n.t('software_version'),
                this.state.software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('model_number'),
                this.state.model_number,
            ),
            generateEditableStringListItem(
                i18n.t('manufacturer'),
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
            if (this.state.current_limit !== null)
                parameter1.current_limit = this.state.current_limit;
            if (this.state.overvoltage !== null)
                parameter1.overvoltage = this.state.overvoltage;
            if (this.state.undervoltage_under_load !== null)
                parameter1.undervoltage_under_load =
                    this.state.undervoltage_under_load;
            if (this.state.undervoltage !== null)
                parameter1.undervoltage = this.state.undervoltage;
            if (this.state.battery_capacity !== null)
                parameter1.battery_capacity = this.state.battery_capacity;
            if (this.state.full_capacity_range !== null)
                parameter1.full_capacity_range = this.state.full_capacity_range;
            if (this.state.speedmeter_magnets_number !== null)
                parameter1.speedmeter_magnets_number =
                    this.state.speedmeter_magnets_number;
            if (this.state.lamps_always_on !== null)
                parameter1.lamps_always_on = this.state.lamps_always_on;
            if (this.state.walk_assist_speed !== null)
                parameter1.walk_assist_speed = this.state.walk_assist_speed;
            if (this.state.start_current !== null)
                parameter1.start_current = this.state.start_current;
            if (this.state.current_loading_time !== null)
                parameter1.current_loading_time =
                    this.state.current_loading_time;
            if (this.state.current_shedding_time !== null)
                parameter1.current_shedding_time =
                    this.state.current_shedding_time;
            if (this.state.pedal_sensor_type !== null)
                parameter1.pedal_sensor_type = this.state.pedal_sensor_type;
            if (this.state.throttle_start_voltage !== null)
                parameter1.throttle_start_voltage =
                    this.state.throttle_start_voltage;
            if (this.state.throttle_max_voltage !== null)
                parameter1.throttle_max_voltage =
                    this.state.throttle_max_voltage;
            if (this.state.assist_levels !== null)
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
            content: i18n.t('writing'),
            duration: 60,
        });
        connection.controller.emitter.once(
            'write-finish',
            (wroteSuccessfully, wroteUnsuccessfully) => {
                message.open({
                    key: 'writing',
                    type: 'info',
                    content: i18n.t('wrote_x_parameters', {
                        successfully: wroteSuccessfully,
                        nonSuccessfully: wroteUnsuccessfully,
                    }),
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
                    {i18n.t('controller')}
                </Typography.Title>
                <Modal
                    title={
                        <>
                            <WarningTwoTone twoToneColor="red" />
                            {'   ' + i18n.t('warning') + '   '}
                            <WarningTwoTone twoToneColor="red" />
                        </>
                    }
                    okText={i18n.t('continue')}
                    cancelText={i18n.t('cancel')}
                    open={this.state.position_sensor_calibration_dialog}
                    onOk={() => {
                        message.open({
                            key: 'position_sensor_calibration',
                            type: 'loading',
                            content: i18n.t('calibrating'),
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
                    <p>{i18n.t('calibration_warning_description')}</p>
                    <p>{i18n.t('calibration_warning_recomendation')}</p>
                </Modal>
                <br />
                <Descriptions
                    bordered
                    title={i18n.t('realtime_data')}
                    items={this.getRealtimeItems()}
                    column={1}
                />
                {this.state.assist_levels && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('electric_parameters')}
                            items={this.getElectricItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('battery_parameters')}
                            items={this.getBatteryItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('mechanical_parameters')}
                            items={this.getMechanicalItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('driving_parameters')}
                            items={this.getDrivingItems()}
                            column={1}
                        />
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('throttle_parameters')}
                            items={this.getThrottleItems()}
                            column={1}
                        />
                        <br />
                        <Title level={5}>{i18n.t('assist_table_title')}</Title>
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
                        <Title level={5}>{i18n.t('torque_table_title')}</Title>
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
                            title={i18n.t('speed_settings')}
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
                    title={i18n.t('calibration_title')}
                    items={this.getCalibrationItems()}
                    column={1}
                />
                <br />
                <Descriptions
                    bordered
                    title={i18n.t('version_list_title')}
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
                            content: i18n.t('loading'),
                            duration: 60,
                        });
                        connection.controller.emitter.once(
                            'read-finish',
                            (readedSuccessfully, readedUnsuccessfully) =>
                                message.open({
                                    key: 'loading',
                                    type: 'info',
                                    content: i18n.t('loaded_x_parameters', {
                                        successfully: readedSuccessfully,
                                        nonSuccessfully: readedUnsuccessfully,
                                    }),
                                    duration: 5,
                                }),
                        );
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

export default BafangCanMotorSettingsView;
