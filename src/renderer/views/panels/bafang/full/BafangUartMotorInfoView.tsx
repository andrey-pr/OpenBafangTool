import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../../../../device/high-level/BafangUartMotor';
import { BafangUartMotorInfo } from '../../../../../types/BafangUartMotorTypes';
import { generateSimpleStringListItem } from '../../../../utils/UIUtils';

type InfoProps = {
    connection: BafangUartMotor;
};

type InfoState = BafangUartMotorInfo & { lastUpdateTime: number };

class BafangUartMotorInfoView extends React.Component<InfoProps, InfoState> {
    constructor(props: any) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.getInfo(),
            lastUpdateTime: 0,
        };
        this.getCodeItems = this.getCodeItems.bind(this);
        this.getVersionItems = this.getVersionItems.bind(this);
        this.getElectricalParameterItems =
            this.getElectricalParameterItems.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        connection.emitter.on('data', this.updateInfo);
    }

    getCodeItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            generateSimpleStringListItem('Serial number', info.serial_number),
            generateSimpleStringListItem('Model', info.model),
            generateSimpleStringListItem('Manufacturer', info.manufacturer),
            generateSimpleStringListItem('System code', info.system_code),
        ];
    }

    getVersionItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            generateSimpleStringListItem(
                'Firmware version',
                info.firmware_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                info.hardware_version,
            ),
        ];
    }

    getElectricalParameterItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            generateSimpleStringListItem('Voltage', info.voltage),
            generateSimpleStringListItem('Max current', info.max_current),
        ];
    }

    updateInfo(): void {
        const { connection } = this.props;
        this.setState({ ...connection.getInfo(), lastUpdateTime: Date.now() });
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
                    title="Codes"
                    items={this.getCodeItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title="Versions"
                    items={this.getVersionItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title="Electrical parameters"
                    items={this.getElectricalParameterItems()}
                    column={1}
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

export default BafangUartMotorInfoView;
