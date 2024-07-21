import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
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
import i18n from '../../../../../i18n/i18n';

const { Text } = Typography;

type InfoProps = {
    connection: BafangCanSystem;
};

type InfoState = {
    controller_realtime0: BafangCanControllerRealtime0 | null;
    controller_realtime1: BafangCanControllerRealtime1 | null;
    controller_hardware_version: string | null;
    controller_software_version: string | null;
    controller_model_number: string | null;
    controller_serial_number: string | null;
    controller_manufacturer: string | null;
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

class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    // TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            controller_realtime0: connection.controller.realtimeData0,
            controller_realtime1: connection.controller.realtimeData1,
            controller_hardware_version: connection.controller.hardwareVersion,
            controller_software_version: connection.controller.softwareVersion,
            controller_model_number: connection.controller.modelNumber,
            controller_serial_number: connection.controller.serialNumber,
            controller_manufacturer: connection.controller.manufacturer,
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
        connection.sensor.emitter.on(
            'data-0',
            (sensor_realtime: BafangCanSensorRealtime) =>
                this.setState({ sensor_realtime }),
        );
        connection.sensor.emitter.on(
            'data-hv',
            (sensor_hardware_version: string) =>
                this.setState({ sensor_hardware_version }),
        );
        connection.sensor.emitter.on(
            'data-sv',
            (sensor_software_version: string) =>
                this.setState({ sensor_software_version }),
        );
        connection.sensor.emitter.on('data-mn', (sensor_model_number: string) =>
            this.setState({ sensor_model_number }),
        );
        connection.sensor.emitter.on(
            'data-sn',
            (sensor_serial_number: string) =>
                this.setState({ sensor_serial_number }),
        );
        connection.display.emitter.on(
            'data-0',
            (display_realtime: BafangCanDisplayRealtimeData) =>
                this.setState({ display_realtime }),
        );
        connection.display.emitter.on(
            'data-1',
            (display_data1: BafangCanDisplayData1) =>
                this.setState({ display_data1 }),
        );
        connection.display.emitter.on(
            'data-2',
            (display_data2: BafangCanDisplayData2) =>
                this.setState({ display_data2 }),
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
        connection.controller.emitter.on(
            'data-hv',
            (controller_hardware_version: string) =>
                this.setState({ controller_hardware_version }),
        );
        connection.controller.emitter.on(
            'data-sv',
            (controller_software_version: string) =>
                this.setState({ controller_software_version }),
        );
        connection.controller.emitter.on(
            'data-mn',
            (controller_model_number: string) =>
                this.setState({ controller_model_number }),
        );
        connection.controller.emitter.on(
            'data-sn',
            (controller_serial_number: string) =>
                this.setState({ controller_serial_number }),
        );
        connection.controller.emitter.on(
            'data-m',
            (controller_manufacturer: string) =>
                this.setState({ controller_manufacturer }),
        );
        connection.controller.emitter.on(
            'data-r0',
            (controller_realtime0: BafangCanControllerRealtime0) =>
                this.setState({ controller_realtime0 }),
        );
        connection.controller.emitter.on(
            'data-r1',
            (controller_realtime1: BafangCanControllerRealtime1) =>
                this.setState({ controller_realtime1 }),
        );
    }

    getControllerItems(): DescriptionsProps['items'] {
        let items: DescriptionsProps['items'] = [];
        const { controller_realtime0, controller_realtime1 } = this.state;
        if (controller_realtime0) {
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
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    'Last trip distance',
                    controller_realtime0.single_trip,
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('cadence'),
                    controller_realtime0.cadence,
                    i18n.t('rpm'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('torque_value'),
                    controller_realtime0.torque,
                    i18n.t('mv'),
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
                generateSimpleStringListItem(i18n.t('cadence'), 'Not available yet'),
                generateSimpleStringListItem(
                    i18n.t('torque_value'),
                    'Not available yet',
                ),
            ];
        }
        if (controller_realtime1) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    i18n.t('voltage'),
                    controller_realtime1.voltage,
                    i18n.t('v'),
                ),
                generateSimpleNumberListItem(
                    'Controller temperature',
                    controller_realtime1.temperature,
                    i18n.t('c_degree'),
                ),
                generateSimpleNumberListItem(
                    'Motor temperature',
                    controller_realtime1.motor_temperature,
                    i18n.t('c_degree'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('current'),
                    controller_realtime1.current,
                    i18n.t('a'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('speed'),
                    controller_realtime1.speed,
                    i18n.t('km/h'),
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(i18n.t('voltage'), 'Not available yet'),
                generateSimpleStringListItem(
                    'Controller temperature',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Motor temperature',
                    'Not available yet',
                ),
                generateSimpleStringListItem(i18n.t('current'), 'Not available yet'),
                generateSimpleStringListItem(i18n.t('speed'), 'Not available yet'),
            ];
        }
        items = [
            ...items,
            generateSimpleStringListItem(
                i18n.t('manufacturer'),
                this.state.controller_manufacturer,
            ),
            generateSimpleStringListItem(
                i18n.t('software_version'),
                this.state.controller_software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.controller_hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('model_number'),
                this.state.controller_model_number,
            ),
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.controller_serial_number,
                i18n.t('serial_number_warning'),
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
                    i18n.t('sport_mode'),
                    i18n.t('eco_mode'),
                ),
                generateSimpleBooleanListItem(
                    'Boost',
                    display_realtime.boost,
                    i18n.t('on'),
                    i18n.t('off'),
                ),
                generateSimpleStringListItem(
                    'Current assist',
                    display_realtime.current_assist_level,
                ),
                generateSimpleBooleanListItem(
                    'Light',
                    display_realtime.light,
                    i18n.t('on'),
                    i18n.t('off'),
                ),
                generateSimpleBooleanListItem(
                    'Button',
                    display_realtime.button,
                    i18n.t('pressed'),
                    i18n.t('not_pressed'),
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
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    'Single mileage',
                    display_data1.single_mileage,
                    i18n.t('km'),
                ),
                generateSimpleNumberListItem(
                    'Max registered speed',
                    display_data1.max_speed,
                    i18n.t('km/h'),
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
                    i18n.t('km/h'),
                ),
                generateSimpleNumberListItem(
                    'Mileage since last service',
                    display_data2.service_mileage,
                    i18n.t('km'),
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
                i18n.t('software_version'),
                this.state.display_software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('manufacturer'),
                this.state.display_manufacturer,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.display_hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('model_number'),
                this.state.display_model_number,
            ),
            generateSimpleStringListItem(
                i18n.t('bootloader_version'),
                this.state.display_bootload_version,
            ),
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.display_serial_number,
                i18n.t('serial_number_warning'),
            ),
            generateSimpleStringListItem(
                i18n.t('customer_number'),
                this.state.display_customer_number,
            ),
        ];
        return items;
    }

    getSensorItems(): DescriptionsProps['items'] {
        const codesArray = [
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.sensor_serial_number,
                i18n.t('serial_number_warning'),
            ),
            generateSimpleStringListItem(
                i18n.t('software_version'),
                this.state.sensor_software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.sensor_hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('model_number'),
                this.state.sensor_model_number,
            ),
        ];
        const { sensor_realtime } = this.state;
        if (sensor_realtime) {
            return [
                generateSimpleNumberListItem(
                    i18n.t('torque_value'),
                    sensor_realtime.torque,
                    i18n.t('mv'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('cadence'),
                    sensor_realtime.cadence,
                    i18n.t('rpm'),
                ),
                ...codesArray,
            ];
        }
        return [
            generateSimpleStringListItem(i18n.t('torque_value'), 'Not available yet'),
            generateSimpleStringListItem(i18n.t('cadence'), 'Not available yet'),
            ...codesArray,
        ];
    }

    getBesstItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                i18n.t('software_version'),
                this.state.besst_software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.besst_hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.besst_serial_number,
                i18n.t('serial_number_warning'),
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
                {!connection.controller.available && (
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
                {connection.controller.available && (
                    <Descriptions
                        bordered
                        title={i18n.t('controller')}
                        items={this.getControllerItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                {connection.display?.available && (
                    <Descriptions
                        bordered
                        title={i18n.t('display')}
                        items={this.getDisplayItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                {connection.sensor.available && (
                    <Descriptions
                        bordered
                        title={i18n.t('sensor')}
                        items={this.getSensorItems()}
                        column={1}
                        style={{ marginBottom: '20px' }}
                    />
                )}
                <Descriptions
                    bordered
                    title={i18n.t('besst_tool')}
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
                            content: i18n.t('loading'),
                            duration: 60,
                        });
                        connection.emitter.once(
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
            </div>
        );
    }
}

export default BafangCanSystemInfoView;
