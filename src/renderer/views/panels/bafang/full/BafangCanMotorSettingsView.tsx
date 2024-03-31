import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, RocketOutlined } from '@ant-design/icons';
import StringInputComponent from '../../../components/StringInput';
import BafangCanSystem from '../../../../device/BafangCanSystem';

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = {
    lastUpdateTime: number;
    oldStyle: boolean;
};

/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            lastUpdateTime: 0,
            oldStyle: false,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.removeAllListeners('write-success');
        connection.emitter.removeAllListeners('write-error');
        connection.emitter.on('data', this.updateData);
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: (
                    <StringInputComponent
                        maxLength={60}
                        value={''}
                        onNewValue={() => {}}
                    />
                ),
            },
        ];
    }

    updateData(): void {
        this.setState({
            lastUpdateTime: Date.now(),
        });
    }

    saveParameters(): void {
        const { connection } = this.props;
        connection.saveData();
    }

    render() {
        const { connection } = this.props;
        const { oldStyle } = this.state;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Motor settings
                </Typography.Title>
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
                <FloatButton
                    icon={<RocketOutlined />}
                    type="primary"
                    style={{ right: 24 }}
                    onClick={this.saveParameters}
                />
            </div>
        );
    }
}

export default BafangCanMotorSettingsView;
