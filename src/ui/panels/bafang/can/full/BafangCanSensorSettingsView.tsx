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
import i18n from '../../../../../i18n/i18n';

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
                    i18n.t('torque_value'),
                    realtime.torque,
                    i18n.t('mv'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('cadence'),
                    realtime.cadence,
                    i18n.t('rpm'),
                ),
            ];
        }
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                this.state.serial_number,
                i18n.t('serial_number_warning'),
            ),
            generateSimpleStringListItem(
                i18n.t('software_version'),
                this.state.software_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                this.state.hardware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('model_number'),
                this.state.model_number,
            ),
        ];
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    {i18n.t('sensor')}
                </Typography.Title>
                {this.state.realtime && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('realtime_data')}
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
                    title={i18n.t('version_list_title')}
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
                            content: i18n.t('loading'),
                            duration: 60,
                        });
                        connection.sensor.emitter.once(
                            'read-finish',
                            (readedSuccessfully, readedUnsuccessfully) =>
                                message.open({
                                    key: 'loading',
                                    type: 'info',
                                    content: i18n.t('loaded_x_parameters', {
                                        successfully: readedSuccessfully,
                                        nonSuccessfully: readedUnsuccessfully,
                                    }),
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
