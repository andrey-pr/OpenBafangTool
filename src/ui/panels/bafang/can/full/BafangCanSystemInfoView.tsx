import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanDisplayCodes,
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
} from '../../../../../types/BafangCanSystemTypes';
import {
    generateSimpleBooleanListItem,
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';

const { Text } = Typography;

type InfoProps = {
    connection: BafangCanSystem;
};

type InfoState = BafangCanDisplayData1 &
    BafangCanControllerCodes &
    BafangCanDisplayCodes &
    BafangCanSensorCodes &
    BafangBesstCodes & {
        controller_realtime0: BafangCanControllerRealtime0;
        controller_realtime1: BafangCanControllerRealtime1;
        display_realtime: BafangCanDisplayRealtimeData;
        sensor_realtime: BafangCanSensorRealtime;
        display_data2: BafangCanDisplayData2;
    };

// TODO add redux
class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    // TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.controllerCodes,
            ...connection.displayData1,
            ...connection.displayCodes,
            ...connection.sensorCodes,
            ...connection.besstCodes,
            controller_realtime0: connection.controllerRealtimeData0,
            controller_realtime1: connection.controllerRealtimeData1,
            display_realtime: connection.displayRealtimeData,
            sensor_realtime: connection.sensorRealtimeData,
            display_data2: connection.displayData2,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('controller-codes-data', this.updateData);
        connection.emitter.on('display-data1', this.updateData);
        connection.emitter.on('display-codes-data', this.updateData);
        connection.emitter.on('sensor-codes-data', this.updateData);
        connection.emitter.on('besst-data', this.updateData);
        connection.emitter.on(
            'controller-realtime-data-0',
            (controller_realtime0: BafangCanControllerRealtime0) =>
                this.setState({ controller_realtime0 }),
        );
        connection.emitter.on(
            'controller-realtime-data-1',
            (controller_realtime1: BafangCanControllerRealtime1) =>
                this.setState({ controller_realtime1 }),
        );
        connection.emitter.on(
            'display-realtime-data',
            (display_realtime: BafangCanDisplayRealtimeData) =>
                this.setState({ display_realtime }),
        );
        connection.emitter.on(
            'sensor-realtime-data',
            (sensor_realtime: BafangCanSensorRealtime) =>
                this.setState({ sensor_realtime }),
        );
        connection.emitter.on(
            'display-data2',
            (display_data2: BafangCanDisplayData2) =>
                this.setState({ display_data2 }),
        );
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getControllerItems(): DescriptionsProps['items'] {
        let items: DescriptionsProps['items'] = [];
        const { controller_realtime0, controller_realtime1 } = this.state;
        if (this.props.connection.isControllerRealtimeData0Ready) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Remaining capacity',
                    controller_realtime0.remaining_capacity,
                    '%',
                ),
                generateSimpleNumberListItem(
                    'Remaining trip distance',
                    controller_realtime0.remaining_distance,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Last trip distance',
                    controller_realtime0.single_trip,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Cadence',
                    controller_realtime0.cadence,
                    'RPM',
                ),
                generateSimpleNumberListItem(
                    'Torque value',
                    controller_realtime0.torque,
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
        if (this.props.connection.isControllerRealtimeData1Ready) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Voltage',
                    controller_realtime1.voltage,
                    'V',
                ),
                generateSimpleNumberListItem(
                    'Controller temperature',
                    controller_realtime1.temperature,
                    'C°',
                ),
                generateSimpleNumberListItem(
                    'Motor temperature',
                    controller_realtime1.motor_temperature,
                    'C°',
                ),
                generateSimpleNumberListItem(
                    'Current',
                    controller_realtime1.current,
                    'A',
                ),
                generateSimpleNumberListItem(
                    'Speed',
                    controller_realtime1.speed,
                    'Km/H',
                ),
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
        items = [
            ...items,
            generateSimpleStringListItem(
                'Manufacturer',
                this.state.controller_manufacturer,
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
            generateSimpleStringListItem(
                'Serial number',
                this.state.controller_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
        ];
        return items;
    }

    getDisplayItems(): DescriptionsProps['items'] {
        let items: DescriptionsProps['items'] = [];
        if (this.props.connection.isDisplayRealtimeDataReady) {
            const { display_realtime } = this.state;
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Assist levels number',
                    display_realtime.assist_levels,
                ),
                generateSimpleBooleanListItem(
                    'Mode',
                    display_realtime.ride_mode,
                    'SPORT',
                    'ECO',
                ),
                generateSimpleBooleanListItem(
                    'Boost',
                    display_realtime.boost,
                    'ON',
                    'OFF',
                ),
                generateSimpleStringListItem(
                    'Current assist',
                    display_realtime.current_assist_level,
                ),
                generateSimpleBooleanListItem(
                    'Light',
                    display_realtime.light,
                    'ON',
                    'OFF',
                ),
                generateSimpleBooleanListItem(
                    'Button',
                    display_realtime.button,
                    'Pressed',
                    'Not pressed',
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Assist levels number',
                    'Not available yet',
                ),
                generateSimpleStringListItem('Mode', 'Not available yet'),
                generateSimpleStringListItem('Boost', 'Not available yet'),
                generateSimpleStringListItem(
                    'Current assist',
                    'Not available yet',
                ),
                generateSimpleStringListItem('Light', 'Not available yet'),
                generateSimpleStringListItem('Button', 'Not available yet'),
            ];
        }
        if (this.props.connection.isDisplayData1Available) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Total mileage',
                    this.state.display_total_mileage,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Single mileage',
                    this.state.display_single_mileage,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Max registered speed',
                    this.state.display_max_speed,
                    'Km/H',
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Total mileage',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Single mileage',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Max registered speed',
                    'Not available yet',
                ),
            ];
        }
        if (this.props.connection.isDisplayData2Available) {
            const { display_data2 } = this.state;
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Average speed',
                    display_data2.average_speed,
                    'Km/H',
                ),
                generateSimpleNumberListItem(
                    'Mileage since last service',
                    display_data2.service_mileage,
                    'Km',
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Average speed',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Mileage since last service',
                    'Not available yet',
                ),
            ];
        }
        items = [
            ...items,
            generateSimpleStringListItem(
                'Software version',
                this.state.display_software_version,
            ),
            generateSimpleStringListItem(
                'Manufacturer',
                this.state.display_manufacturer,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.display_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.display_model_number,
            ),
            generateSimpleStringListItem(
                'Bootloader version',
                this.state.display_bootload_version,
            ),
            generateSimpleStringListItem(
                'Serial number',
                this.state.display_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Customer number',
                this.state.display_customer_number,
            ),
        ];
        return items;
    }

    getSensorItems(): DescriptionsProps['items'] {
        const codesArray = [
            generateSimpleStringListItem(
                'Hardware version',
                this.state.sensor_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.sensor_model_number,
            ),
            generateSimpleStringListItem(
                'Serial number',
                this.state.sensor_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Customer number',
                this.state.sensor_customer_number,
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.sensor_software_version,
            ),
        ];
        if (this.props.connection.isSensorRealtimeDataReady) {
            const { sensor_realtime } = this.state;
            return [
                generateSimpleNumberListItem(
                    'Torque value',
                    sensor_realtime.torque,
                    'mV',
                ),
                generateSimpleNumberListItem(
                    'Cadence',
                    sensor_realtime.cadence,
                    'RPM',
                ),
                ...codesArray,
            ];
        }
        return [
            generateSimpleStringListItem('Torque value', 'Not available yet'),
            generateSimpleStringListItem('Cadence', 'Not available yet'),
            ...codesArray,
        ];
    }

    getBesstItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                'Software version',
                this.state.besst_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.besst_hardware_version,
            ),
            generateSimpleStringListItem(
                'Serial number',
                this.state.besst_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
        ];
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Info
                </Typography.Title>
                <br />
                {!connection.isControllerAvailable && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Controller is not connected
                            </Text>
                        </div>
                        <br />
                    </>
                )}
                {!connection.isDisplayAvailable && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">Display is not connected</Text>
                        </div>
                        <br />
                    </>
                )}
                {!connection.isSensorAvailable && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">Sensor is not connected</Text>
                        </div>
                        <br />
                    </>
                )}
                {connection.isControllerAvailable && (
                    <Descriptions
                        bordered
                        title="Controller"
                        items={this.getControllerItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                {connection.isDisplayAvailable && (
                    <Descriptions
                        bordered
                        title="Display"
                        items={this.getDisplayItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                {connection.isSensorAvailable && (
                    <Descriptions
                        bordered
                        title="Sensor"
                        items={this.getSensorItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
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
            </div>
        );
    }
}

export default BafangCanSystemInfoView;
