import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangBesstCodes,
    BafangCanControllerCodes,
    BafangCanControllerRealtime,
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
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

type InfoState = BafangCanControllerRealtime &
    BafangCanSensorRealtime &
    BafangCanDisplayState &
    BafangCanDisplayData &
    BafangCanControllerCodes &
    BafangCanDisplayCodes &
    BafangCanSensorCodes &
    BafangBesstCodes;

//TODO add redux
class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    //TODO redesign as a dashboard and remove version fields
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.controllerCodes,
            ...connection.displayData,
            ...connection.displayCodes,
            ...connection.sensorCodes,
            ...connection.besstCodes,
            ...connection.controllerRealtimeData,
            ...connection.displayRealtimeData,
            ...connection.sensorRealtimeData,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('controller-codes-data', this.updateData);
        connection.emitter.on('display-general-data', this.updateData);
        connection.emitter.on('display-codes-data', this.updateData);
        connection.emitter.on('sensor-codes-data', this.updateData);
        connection.emitter.on('besst-data', this.updateData);
        connection.emitter.on('broadcast-data-controller', this.updateData);
        connection.emitter.on('broadcast-data-display', this.updateData);
        connection.emitter.on('broadcast-data-sensor', this.updateData);
    }

    updateData(values: any) {
        //TODO add property check
        this.setState(values);
    }

    getControllerItems(): DescriptionsProps['items'] {
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
    }

    getDisplayItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'Assist levels number',
                this.state.display_assist_levels,
            ),
            generateSimpleBooleanListItem(
                'Mode',
                this.state.display_ride_mode,
                'SPORT',
                'ECO',
            ),
            generateSimpleBooleanListItem(
                'Boost',
                this.state.display_boost,
                'ON',
                'OFF',
            ),
            generateSimpleStringListItem(
                'Current assist',
                this.state.display_current_assist_level,
            ),
            generateSimpleBooleanListItem(
                'Light',
                this.state.display_light,
                'ON',
                'OFF',
            ),
            generateSimpleBooleanListItem(
                'Button',
                this.state.display_button,
                'Pressed',
                'Not pressed',
            ),
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
            generateSimpleNumberListItem(
                'Average speed',
                this.state.display_average_speed,
                'Km/H',
            ),
            generateSimpleNumberListItem(
                'Mileage since last service',
                this.state.display_service_mileage,
                'Km',
            ),
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
    }

    getSensorItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'Torque value',
                this.state.sensor_torque,
                'mV',
            ),
            generateSimpleNumberListItem(
                'Cadence',
                this.state.sensor_cadence,
                'RPM',
            ),
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
