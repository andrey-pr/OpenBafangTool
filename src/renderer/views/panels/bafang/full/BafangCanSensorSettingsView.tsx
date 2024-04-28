import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import StringInputComponent from '../../../components/StringInput';
import BafangCanSystem from '../../../../device/BafangCanSystem';
import {
    BafangCanSensorCodes,
    BafangCanSensorRealtime,
} from '../../../../types/BafangCanSystemTypes';
import StringValueComponent from '../../../components/StringValueComponent';
import { generateSimpleNumberListItem, generateSimpleStringListItem } from '../../../../utils/UIUtils';

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanSensorRealtime & BafangCanSensorCodes;

/* eslint-disable camelcase */
class BafangCanSensorSettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.sensorCodes,
            ...connection.sensorRealtimeData,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('sensor-codes-data', this.updateData);
        connection.emitter.on('broadcast-data-sensor', this.updateData);
    }

    updateData(values: any) {
        //TODO add property check
        this.setState({ ...values });
    }

    getRealtimeItems(): DescriptionsProps['items'] {
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
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            sensor_serial_number,
            sensor_customer_number,
            sensor_manufacturer,
        } = this.state;
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={sensor_serial_number}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_serial_number: e,
                            });
                        }}
                        errorOnEmpty
                    />
                ),
            },
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
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={sensor_manufacturer}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_manufacturer: e,
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
                        value={sensor_customer_number}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_customer_number: e,
                            });
                        }}
                    />
                ),
            },
            generateSimpleStringListItem(
                'Bootloader version',
                this.state.sensor_bootload_version,
            ),
        ];
    }

    saveParameters(): void {
        const { connection } = this.props;
        connection.sensorCodes = this.state as BafangCanSensorCodes;
        connection.saveData();
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Sensor settings
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
                            duration: 10,
                        });
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

export default BafangCanSensorSettingsView;

