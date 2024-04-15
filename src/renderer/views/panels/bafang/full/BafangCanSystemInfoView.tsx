import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../device/BafangCanSystem';
import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerRealtime,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
} from '../../../../device/BafangCanSystemTypes';
import NumberValueComponent from '../../../components/NumberValueComponent';
import StringValueComponent from '../../../components/StringValueComponent';
import BooleanValueComponent from '../../../components/BooleanValueComponent';
import { NotLoadedYet } from '../../../../types/no_data';

type InfoProps = {
    connection: BafangCanSystem;
};

type InfoState = BafangCanControllerRealtime &
    BafangCanSensorRealtime &
    BafangCanDisplayState &
    BafangCanDisplayData &
    BafangCanControllerCodes &
    BafangCanDisplayCodes &
    BafangCanSensorCodes &
    BafangBesstCodes;

class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    //TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.getControllerCodes(),
            ...connection.getDisplayState(),
            ...connection.getDisplayData(),
            ...connection.getDisplayCodes(),
            ...connection.getSensorCodes(),
            ...connection.getBesstCodes(),
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
            sensor_torque: NotLoadedYet,
            sensor_cadence: NotLoadedYet,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        this.updateRealtimeData = this.updateRealtimeData.bind(this);
        connection.emitter.on(
            'controller-data',
            (data: BafangCanControllerCodes) => this.setState({ ...data }),
        );
        connection.emitter.on('display-general-data', (data: BafangCanDisplayData) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('display-state-data', (data: BafangCanDisplayState) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('display-codes-data', (data: BafangCanDisplayCodes) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('sensor-data', (data: BafangCanSensorCodes) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('besst-data', (data: BafangBesstCodes) =>
            this.setState({ ...data }),
        );
        connection.emitter.on(
            'broadcast-data-controller',
            this.updateRealtimeData,
        );
        connection.emitter.on('broadcast-data-sensor', this.updateRealtimeData);
    }

    getControllerItems(): DescriptionsProps['items'] {
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
        console.log(controller_speed);
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
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringValueComponent value={controller_manufacturer} />
                ),
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringValueComponent value={controller_software_version} />
                ),
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringValueComponent value={controller_hardware_version} />
                ),
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: (
                    <StringValueComponent value={controller_bootload_version} />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: (
                    <StringValueComponent value={controller_model_number} />
                ),
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringValueComponent value={controller_serial_number} />
                ),
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringValueComponent value={controller_customer_number} />
                ),
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
            display_assist_levels,
            display_ride_mode,
            display_boost,
            display_current_assist_level,
            display_light,
            display_button,
            display_total_mileage,
            display_single_mileage,
            display_max_speed,
            display_average_speed,
            display_service_mileage,
        } = this.state;
        console.log(display_total_mileage);
        return [
            {
                key: 'assist_levels_number',
                label: 'Assist levels number',
                children: (
                    <NumberValueComponent value={display_assist_levels} />
                ),
            },
            {
                key: 'eco_sport_mode',
                label: 'Mode',
                children: (
                    <BooleanValueComponent
                        value={display_ride_mode === 1}
                        textTrue="SPORT"
                        textFalse="ECO"
                    />
                ),
            },
            {
                key: 'boost',
                label: 'Boost',
                children: (
                    <BooleanValueComponent
                        value={display_boost}
                        textTrue="On"
                        textFalse="Off"
                    />
                ),
            },
            {
                key: 'current_assist_level',
                label: 'Current assist',
                children: <StringValueComponent value={`${display_current_assist_level}`}/>
            },
            {
                key: 'light',
                label: 'Light',
                children: (
                    <BooleanValueComponent
                        value={display_light}
                        textTrue="On"
                        textFalse="Off"
                    />
                ),
            },
            {
                key: 'button',
                label: 'Button',
                children: (
                    <BooleanValueComponent
                        value={display_button}
                        textTrue="Pressed"
                        textFalse="Not pressed"
                    />
                ), // pressed or released
            },
            {
                key: 'total_mileage',
                label: 'Total mileage',
                children: (
                    <NumberValueComponent
                        value={display_total_mileage}
                        unit="Km"
                    />
                ),
            },
            {
                key: 'single_mileage',
                label: 'Single mileage',
                children: (
                    <NumberValueComponent
                        value={display_single_mileage}
                        unit="Km"
                    />
                ),
            },
            {
                key: 'max_registered_speed',
                label: 'Max registered speed',
                children: (
                    <NumberValueComponent
                        value={display_max_speed}
                        unit="Km/H"
                    />
                ),
            },
            {
                key: 'average_speed',
                label: 'Average speed',
                children: (
                    <NumberValueComponent
                        value={display_average_speed}
                        unit="Km/H"
                    />
                ),
            },
            {
                key: 'service_mileage',
                label: 'Mileage since last service',
                children: (
                    <NumberValueComponent
                        value={display_service_mileage}
                        unit="Km"
                    />
                ),
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringValueComponent value={display_software_version} />
                ),
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: <StringValueComponent value={display_manufacturer} />,
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringValueComponent value={display_hardware_version} />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: <StringValueComponent value={display_model_number} />,
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: (
                    <StringValueComponent value={display_bootload_version} />
                ),
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringValueComponent value={display_serial_number} />
                ),
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringValueComponent value={display_customer_number} />
                ),
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
                children: (
                    <NumberValueComponent value={sensor_torque} unit="mV" />
                ),
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: (
                    <NumberValueComponent value={sensor_cadence} unit="RPM" />
                ),
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringValueComponent value={sensor_hardware_version} />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: <StringValueComponent value={sensor_model_number} />,
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: (
                    <StringValueComponent value={sensor_bootload_version} />
                ),
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: <StringValueComponent value={sensor_serial_number} />,
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringValueComponent value={sensor_customer_number} />
                ),
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: <StringValueComponent value={sensor_manufacturer} />,
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringValueComponent value={sensor_software_version} />
                ),
            },
        ];
    }

    getBesstItems(): DescriptionsProps['items'] {
        const {
            besst_hardware_version,
            besst_software_version,
            besst_serial_number,
        } = this.state;
        return [
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringValueComponent value={besst_software_version} />
                ), //TODO add editing
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringValueComponent value={besst_hardware_version} />
                ), //TODO add editing
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: <StringValueComponent value={besst_serial_number} />, //TODO add editing
            },
        ];
    }

    updateRealtimeData(variables: any): void {
        this.setState({ ...variables });
    }

    render() {
        const { connection } = this.props;
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
                    items={this.getSensorItems()}
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
                            //TODO
                            // const { lastUpdateTime } = this.state;
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
            </div>
        );
    }
}

export default BafangCanSystemInfoView;
