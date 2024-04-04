import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../device/BafangCanSystem';
import {
    BafangCanControllerCodes,
    BafangCanControllerRealtime,
    BafangCanDisplayCodes,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
} from '../../../../device/BafangCanSystemTypes';

type InfoProps = {
    connection: BafangCanSystem;
};

type InfoState = BafangCanControllerRealtime &
    BafangCanSensorRealtime &
    BafangCanControllerCodes &
    BafangCanDisplayCodes &
    BafangCanSensorCodes & { lastUpdateTime: number };

class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    //TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.getControllerCodes(),
            ...connection.getDisplayCodes(),
            ...connection.getSensorCodes(),
            controller_cadence: 0,
            controller_torque: 0,
            controller_speed: 0,
            controller_current: 0,
            controller_voltage: 0,
            controller_temperature: 0,
            controller_motor_temperature: 0,
            controller_walk_assistance: false,
            controller_calories: 0,
            controller_remaining_capacity: 0,
            controller_single_trip: 0,
            controller_remaining_distance: 0,
            sensor_torque: 0,
            sensor_cadence: 0,
            lastUpdateTime: 0,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateRealtimeData = this.updateRealtimeData.bind(this);
        connection.emitter.on('data', this.updateData);
        connection.emitter.on(
            'broadcast-data-controller',
            this.updateRealtimeData,
        );
        connection.emitter.on('broadcast-data-sensor', this.updateRealtimeData);
    }

    getControllerItems(): DescriptionsProps['items'] {
        const {controller_cadence,
            controller_torque,
            controller_speed,
            controller_current,
            controller_voltage,
            controller_temperature,
            controller_motor_temperature,
            controller_walk_assistance,
            controller_calories,
            controller_serial_number,
            controller_bootload_version,
            controller_customer_number,
            controller_hardware_version,
            controller_manufacturer,
            controller_model_number,
            controller_software_version,
            controller_remaining_capacity,
            controller_single_trip,
            controller_remaining_distance,
        } = this.state;
        return [
            {
                key: 'capacity_left',
                label: 'Remaining capacity',
                children: controller_remaining_capacity,
            },
            {
                key: 'remaining_trip',
                label: 'Remaining trip distance',
                children: controller_remaining_distance,
            },
            {
                key: 'single_trip',
                label: 'Last trip distance',
                children: controller_single_trip,
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: controller_cadence,
            },
            {
                key: 'torque_value',
                label: 'Torque value',
                children: controller_torque,
            },
            {
                key: 'voltage',
                label: 'Voltage',
                children: controller_voltage,
            },
            {
                key: 'controller_temperature',
                label: 'Controller temperature',
                children: controller_temperature,
            },
            {
                key: 'motor_temperature',
                label: 'Motor temperature',
                children: controller_motor_temperature,
            },
            {
                key: 'walk_assist',
                label: 'Walk assist status',
                children: controller_walk_assistance,
            },
            {
                key: 'calories',
                label: 'Calories',
                children: controller_calories,
            },
            {
                key: 'current',
                label: 'Current',
                children: controller_current,
            },
            {
                key: 'speed',
                label: 'Speed',
                children: controller_speed,
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: controller_manufacturer,
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: controller_software_version,
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: controller_hardware_version,
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: controller_bootload_version,
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: controller_model_number,
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: controller_serial_number,
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: controller_customer_number,
            },
        ];
    }

    getDisplayItems(): DescriptionsProps['items'] {
        const {
            display_serial_number,
            display_bootload_version,
            display_customer_number,
            display_hardware_version,
            display_manufacturer,
            display_model_number,
            display_software_version,
        } = this.state;
        return [
            {
                key: 'gear_levels_number',
                label: 'Gear levels number',
                children: '',
            },
            {
                key: 'eco_sport_mode',
                label: 'Mode',
                children: '',
            },
            {
                key: 'boost',
                label: 'Boost',
                children: '',
            },
            {
                key: 'current_gear_level',
                label: 'Current gear',
                children: '',
            },
            {
                key: 'light',
                label: 'Light',
                children: '',
            },
            {
                key: 'button',
                label: 'Button',
                children: '', // pressed or released
            },
            {
                key: 'total_mileage',
                label: 'Total mileage',
                children: '',
            },
            {
                key: 'single_mileage',
                label: 'Single mileage',
                children: '',
            },
            {
                key: 'max_registered_speed',
                label: 'Max registered speed',
                children: '',
            },
            {
                key: 'average_speed',
                label: 'Average speed',
                children: '',
            },
            {
                key: 'service_mileage',
                label: 'Mileage since last service',
                children: '',
            },
            {
                key: 'last_shutdown_time',
                label: 'Last shutdown time',
                children: '',
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: display_software_version,
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: display_manufacturer,
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: display_hardware_version,
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: display_model_number,
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: display_bootload_version,
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: display_serial_number,
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: display_customer_number,
            },
        ];
    }

    getSensorItems(): DescriptionsProps['items'] {
        const {
            sensor_serial_number,
            sensor_bootload_version,
            sensor_customer_number,
            sensor_hardware_version,
            sensor_manufacturer,
            sensor_model_number,
            sensor_software_version,
            sensor_torque,
            sensor_cadence,
        } = this.state;
        return [
            {
                key: 'torque_value',
                label: 'Torque value',
                children: sensor_torque,
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: sensor_cadence,
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: sensor_hardware_version,
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: sensor_model_number,
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: sensor_bootload_version,
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: sensor_serial_number,
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: sensor_customer_number,
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: sensor_manufacturer,
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: sensor_software_version,
            },
        ];
    }

    getBesstItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        return [
            {
                key: 'software_version',
                label: 'Software version',
                children: '',
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: '',
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: '',
            },
        ];
    }

    updateData(): void {
        const { connection } = this.props;
        this.setState({
            ...connection.getControllerCodes(),
            ...connection.getDisplayCodes(),
            ...connection.getSensorCodes(),
            lastUpdateTime: Date.now(),
        });
    }

    updateRealtimeData(variables: any): void {
        this.setState({ ...variables });
    }

    render() {
        const { connection } = this.props;
        let sensorData = this.getSensorItems();
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Info
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title="Controller"
                    items={this.getControllerItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title="Display"
                    items={this.getDisplayItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title="Sensor"
                    items={sensorData}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title="BESST Tool"
                    items={this.getBesstItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <FloatButton
                    icon={<SyncOutlined />}
                    type="primary"
                    style={{ right: 24 }}
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
            </div>
        );
    }
}

export default BafangCanSystemInfoView;
