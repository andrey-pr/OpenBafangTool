import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import StringInputComponent from '../../../components/StringInput';
import BafangCanSystem from '../../../../device/BafangCanSystem';
import {
    BafangCanControllerCodes,
    BafangCanControllerRealtime,
} from '../../../../device/BafangCanSystemTypes';
import { NotLoadedYet } from '../../../../types/no_data';
import NumberValueComponent from '../../../components/NumberValueComponent';
import BooleanValueComponent from '../../../components/BooleanValueComponent';

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanControllerRealtime & BafangCanControllerCodes;

/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    //TODO add param1
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.getControllerCodes(),
            controller_cadence: NotLoadedYet,
            controller_torque: NotLoadedYet,
            controller_speed: NotLoadedYet,
            controller_current: NotLoadedYet,
            controller_voltage: NotLoadedYet,
            controller_temperature: NotLoadedYet,
            controller_motor_temperature: NotLoadedYet,
            controller_walk_assistance: NotLoadedYet,
            controller_calories: NotLoadedYet,
            controller_remaining_capacity: NotLoadedYet,
            controller_single_trip: NotLoadedYet,
            controller_remaining_distance: NotLoadedYet,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateRealtimeData = this.updateRealtimeData.bind(this);
        connection.emitter.on(
            'controller-data',
            (data: BafangCanControllerCodes) => this.setState({ ...data }),
        );
        connection.emitter.on(
            'broadcast-data-controller',
            this.updateRealtimeData,
        );
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        const {
            controller_cadence,
            controller_torque,
            controller_speed,
            controller_current,
            controller_voltage,
            controller_temperature,
            controller_motor_temperature,
            controller_walk_assistance,
            controller_calories,
            controller_remaining_capacity,
            controller_single_trip,
            controller_remaining_distance,
        } = this.state;
        return [
            {
                key: 'capacity_left',
                label: 'Remaining capacity',
                children: (
                    <NumberValueComponent
                        value={controller_remaining_capacity}
                        unit="mAh"
                    />
                ),
            },
            {
                key: 'remaining_trip',
                label: 'Remaining trip distance',
                children: (
                    <NumberValueComponent
                        value={controller_remaining_distance}
                        unit="Km"
                    />
                ),
            },
            {
                key: 'single_trip',
                label: 'Last trip distance',
                children: (
                    <NumberValueComponent
                        value={controller_single_trip}
                        unit="Km"
                    />
                ),
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: (
                    <NumberValueComponent
                        value={controller_cadence}
                        unit="RPM"
                    />
                ),
            },
            {
                key: 'torque_value',
                label: 'Torque value',
                children: (
                    <NumberValueComponent value={controller_torque} unit="mV" />
                ),
            },
            {
                key: 'voltage',
                label: 'Voltage',
                children: (
                    <NumberValueComponent value={controller_voltage} unit="V" />
                ),
            },
            {
                key: 'controller_temperature',
                label: 'Controller temperature',
                children: (
                    <NumberValueComponent
                        value={controller_temperature}
                        unit="C°"
                    />
                ),
            },
            {
                key: 'motor_temperature',
                label: 'Motor temperature',
                children: (
                    <NumberValueComponent
                        value={controller_motor_temperature}
                        unit="C°"
                    />
                ),
            },
            {
                key: 'walk_assist',
                label: 'Walk assist status',
                children: (
                    <BooleanValueComponent
                        value={controller_walk_assistance}
                        textTrue="On"
                        textFalse="Off"
                    />
                ),
            },
            {
                key: 'calories',
                label: 'Calories',
                children: (
                    <NumberValueComponent
                        value={controller_calories}
                        unit="Cal."
                    />
                ),
            },
            {
                key: 'current',
                label: 'Current',
                children: (
                    <NumberValueComponent value={controller_current} unit="A" />
                ),
            },
            {
                key: 'speed',
                label: 'Speed',
                children: (
                    <NumberValueComponent
                        value={controller_speed}
                        unit="Km/H"
                    />
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            controller_serial_number,
            controller_bootload_version,
            controller_customer_number,
            controller_hardware_version,
            controller_manufacturer,
            controller_model_number,
            controller_software_version,
        } = this.state;
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_serial_number}
                        onNewValue={(e) => {
                            this.setState({
                                controller_serial_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_software_version}
                        onNewValue={(e) => {
                            this.setState({
                                controller_software_version: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_hardware_version}
                        onNewValue={(e) => {
                            this.setState({
                                controller_hardware_version: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_model_number}
                        onNewValue={(e) => {
                            this.setState({
                                controller_model_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_manufacturer}
                        onNewValue={(e) => {
                            this.setState({
                                controller_manufacturer: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_customer_number}
                        onNewValue={(e) => {
                            this.setState({
                                controller_customer_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_bootload_version}
                        onNewValue={(e) => {
                            this.setState({
                                controller_bootload_version: e,
                            });
                        }}
                    />
                ),
            },
        ];
    }

    updateRealtimeData(variables: any): void {
        this.setState({ ...variables });
    }

    saveParameters(): void {
        const { connection } = this.props;
        connection.saveData();
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Motor settings
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title="Real-Time data"
                    items={this.getRealtimeItems()}
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
                        });
                        setTimeout(() => {
                            // if (Date.now() - lastUpdateTime < 3000) {
                            //     message.open({
                            //         key: 'loading',
                            //         type: 'success',
                            //         content: 'Read sucessfully!',
                            //         duration: 2,
                            //     });
                            // } else {
                            //     message.open({
                            //         key: 'loading',
                            //         type: 'error',
                            //         content: 'Error during reading!',
                            //         duration: 2,
                            //     });
                            // }
                        }, 3000);
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