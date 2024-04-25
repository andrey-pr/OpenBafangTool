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
import NumberValueComponent from '../../../components/NumberValueComponent';
import { NotLoadedYet } from '../../../../types/no_data';

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
            sensor_torque: NotLoadedYet,
            sensor_cadence: NotLoadedYet,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        connection.emitter.on(
            'sensor-codes-data',
            (data: BafangCanSensorCodes) => this.setState({ ...data }),
        );
        connection.emitter.on('broadcast-data-sensor', (data) =>
            this.setState({ ...data }),
        );
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        const { sensor_torque, sensor_cadence } = this.state;
        return [
            {
                key: 'torque_value',
                label: 'Torque value',
                children: (
                    <NumberValueComponent value={sensor_torque} unit="mV" />
                ),
                contentStyle: { width: '50%' },
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: (
                    <NumberValueComponent value={sensor_cadence} unit="RPM" />
                ),
                contentStyle: { width: '50%' },
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            sensor_serial_number,
            sensor_bootload_version,
            sensor_customer_number,
            sensor_hardware_version,
            sensor_manufacturer,
            sensor_model_number,
            sensor_software_version,
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
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={sensor_software_version}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_software_version: e,
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
                        value={sensor_hardware_version}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_hardware_version: e,
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
                        value={sensor_model_number}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_model_number: e,
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
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={sensor_bootload_version}
                        onNewValue={(e) => {
                            this.setState({
                                sensor_bootload_version: e,
                            });
                        }}
                    />
                ),
            },
        ];
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

export default BafangCanSensorSettingsView;
