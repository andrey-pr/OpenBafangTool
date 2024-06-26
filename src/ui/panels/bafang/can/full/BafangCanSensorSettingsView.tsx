import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import { BafangCanSensorRealtime } from '../../../../../types/BafangCanSystemTypes';
import {
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';

const { Text } = Typography;

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = {
    realtime: BafangCanSensorRealtime | null;
    hardware_version: string | null;
    software_version: string | null;
    model_number: string | null;
    serial_number: string | null;
};

// TODO add redux
/* eslint-disable camelcase */
class BafangCanSensorSettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            realtime: connection.sensor.realtimeData,
            hardware_version: connection.sensor.hardwareVersion,
            software_version: connection.sensor.softwareVersion,
            model_number: connection.sensor.modelNumber,
            serial_number: connection.sensor.serialNumber,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        connection.sensor.emitter.on(
            'data-0',
            (realtime: BafangCanSensorRealtime) => this.setState({ realtime }),
        );
        connection.sensor.emitter.on('data-hv', (hardware_version: string) =>
            this.setState({ hardware_version }),
        );
        connection.sensor.emitter.on('data-sv', (software_version: string) =>
            this.setState({ software_version }),
        );
        connection.sensor.emitter.on('data-mn', (model_number: string) =>
            this.setState({ model_number }),
        );
        connection.sensor.emitter.on('data-sn', (serial_number: string) =>
            this.setState({ serial_number }),
        );
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        const { realtime } = this.state;
        if (realtime) {
            return [
                generateSimpleNumberListItem(
                    'Torque value',
                    realtime.torque,
                    'mV',
                ),
                generateSimpleNumberListItem(
                    'Cadence',
                    realtime.cadence,
                    'RPM',
                ),
            ];
        }
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                'Serial number',
                this.state.serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.model_number,
            ),
        ];
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Sensor settings
                </Typography.Title>
                {this.state.realtime && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Real-Time data"
                            items={this.getRealtimeItems()}
                            column={1}
                        />
                    </>
                )}
                {!this.state.realtime && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Real-time data from sensor is not received yet
                            </Text>
                        </div>
                    </>
                )}
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
                    style={{ right: 24 }}
                    onClick={() => {
                        connection.sensor.loadData();
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

export default BafangCanSensorSettingsView;
