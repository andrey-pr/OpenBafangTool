import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../device/BafangCanSystem';

type InfoProps = {
    connection: BafangCanSystem;
};

type InfoState = { lastUpdateTime: number };

class BafangCanSystemInfoView extends React.Component<InfoProps, InfoState> {
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            lastUpdateTime: 0,
        };
        this.getControllerItems = this.getControllerItems.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        connection.emitter.on('data', this.updateInfo);
    }

    getControllerItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        return [
            {
                key: 'software_version',
                label: 'Software version',
                children: '',
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: '',
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: '',
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: '',
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: '',
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: '',
            },
        ];
    }

    getDisplayItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        return [
            {
                key: 'software_version',
                label: 'Software version',
                children: '',
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: '',
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: '',
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: '',
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: '',
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: '',
            },
        ];
    }

    getSensorItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        return [
            {
                key: 'torque_value',
                label: 'Torque value',
                children: '',
            },
            {
                key: 'cadence',
                label: 'Cadence',
                children: '',
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: '',
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: '',
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader bersion',
                children: '',
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: '',
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: '',
            },
        ];
    }

    getBesstItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        return [
            {
                key: 'software_version',
                label: 'Software version',
                children: '',
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: '',
            },
            {
                key: 'serial_number',
                label: 'Serial number',
                children: '',
            },
        ];
    }

    updateInfo(): void {
        const { connection } = this.props;
        this.setState({ lastUpdateTime: Date.now() });
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
            </div>
        );
    }
}

export default BafangCanSystemInfoView;
