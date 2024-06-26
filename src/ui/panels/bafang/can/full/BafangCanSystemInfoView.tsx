import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanControllerCodes,
    BafangCanControllerRealtime0,
    BafangCanControllerRealtime1,
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
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

type InfoState = BafangCanControllerCodes & {
    controller_realtime0: BafangCanControllerRealtime0;
    controller_realtime1: BafangCanControllerRealtime1;
    display_realtime: BafangCanDisplayRealtimeData | null;
    display_data1: BafangCanDisplayData1 | null;
    display_data2: BafangCanDisplayData2 | null;
    display_hardware_version: string | null;
    display_software_version: string | null;
    display_model_number: string | null;
    display_serial_number: string | null;
    display_customer_number: string | null;
    display_manufacturer: string | null;
    display_bootload_version: string | null;
    sensor_realtime: BafangCanSensorRealtime | null;
    sensor_hardware_version: string | null;
    sensor_software_version: string | null;
    sensor_model_number: string | null;
    sensor_serial_number: string | null;
    besst_serial_number: string | null;
    besst_software_version: string | null;
    besst_hardware_version: string | null;
};

// TODO add redux
class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    // TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.controllerCodes,
            controller_realtime0: connection.controllerRealtimeData0,
            controller_realtime1: connection.controllerRealtimeData1,
            display_realtime: connection.display.realtimeData,
            sensor_realtime: connection.sensor.realtimeData,
            display_data1: connection.display.data1,
            display_data2: connection.display.data2,
            display_hardware_version: connection.display.hardwareVersion,
            display_software_version: connection.display.softwareVersion,
            display_model_number: connection.display.modelNumber,
            display_serial_number: connection.display.serialNumber,
            display_customer_number: connection.display.customerNumber,
            display_manufacturer: connection.display.manufacturer,
            display_bootload_version: connection.display.bootloaderVersion,
            sensor_hardware_version: connection.sensor.hardwareVersion,
            sensor_software_version: connection.sensor.softwareVersion,
            sensor_model_number: connection.sensor.modelNumber,
            sensor_serial_number: connection.sensor.serialNumber,
            besst_serial_number: connection.besst.serialNumber,
            besst_software_version: connection.besst.softwareVersion,
            besst_hardware_version: connection.besst.hardwareVersion,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        connection.besst.emitter.on('data-sn', (besst_serial_number: string) =>
            this.setState({ besst_serial_number }),
        );
        connection.besst.emitter.on(
            'data-sv',
            (besst_software_version: string) =>
                this.setState({ besst_software_version }),
        );
        connection.besst.emitter.on(
            'data-hv',
            (besst_hardware_version: string) =>
                this.setState({ besst_hardware_version }),
        );
        connection.display.emitter.on(
            'data-0',
            (display_realtime: BafangCanDisplayRealtimeData) =>
                this.setState({ display_realtime }),
        );
        connection.display.emitter.on(
            'data-1',
            (display_data1: BafangCanDisplayData1) => this.setState({ display_data1 }),
        );
        connection.display.emitter.on(
            'data-2',
            (display_data2: BafangCanDisplayData2) => this.setState({ display_data2 }),
        );
        connection.display.emitter.on(
            'data-hv',
            (display_hardware_version: string) =>
                this.setState({ display_hardware_version }),
        );
        connection.display.emitter.on(
            'data-sv',
            (display_software_version: string) =>
                this.setState({ display_software_version }),
        );
        connection.display.emitter.on(
            'data-mn',
            (display_model_number: string) =>
                this.setState({ display_model_number }),
        );
        connection.display.emitter.on(
            'data-sn',
            (display_serial_number: string) =>
                this.setState({ display_serial_number }),
        );
        connection.display.emitter.on(
            'data-cn',
            (display_customer_number: string) =>
                this.setState({ display_customer_number }),
        );
        connection.display.emitter.on(
            'data-m',
            (display_manufacturer: string) =>
                this.setState({ display_manufacturer }),
        );
        connection.display.emitter.on(
            'data-bv',
            (display_bootload_version: string) =>
                this.setState({ display_bootload_version }),
        );
        // connection.emitter.on(
        //     'controller-realtime-data-0',
        //     (controller_realtime0: BafangCanControllerRealtime0) =>
        //         this.setState({ controller_realtime0 }),
        // );
        // connection.emitter.on(
        //     'controller-realtime-data-1',
        //     (controller_realtime1: BafangCanControllerRealtime1) =>
        //         this.setState({ controller_realtime1 }),
        // );
        // connection.emitter.on(
        //     'sensor-realtime-data',
        //     (sensor_realtime: BafangCanSensorRealtime) =>
        //         this.setState({ sensor_realtime }),
        // );
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
        if (this.state.display_realtime) {
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
        if (this.state.display_data1) {
            const { display_data1 } = this.state;
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Total mileage',
                    display_data1.total_mileage,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Single mileage',
                    display_data1.single_mileage,
                    'Km',
                ),
                generateSimpleNumberListItem(
                    'Max registered speed',
                    display_data1.max_speed,
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
        if (this.state.display_data2) {
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
                'Serial number',
                this.state.sensor_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.sensor_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.sensor_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.sensor_model_number,
            ),
        ];
        const { sensor_realtime } = this.state;
        if (sensor_realtime) {
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
                {!connection.display?.available && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">Display is not connected</Text>
                        </div>
                        <br />
                    </>
                )}
                {!connection.sensor.available && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">Sensor is not connected</Text>
                        </div>
                        <br />
                    </>
                )}
                {!connection.battery?.available && (
                    <>
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">Battery is not digital</Text>
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
                {connection.display?.available && (
                    <Descriptions
                        bordered
                        title="Display"
                        items={this.getDisplayItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                {connection.sensor.available && (
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
