import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangUartMotor from '../../../../../device/high-level/BafangUartMotor';
import { BafangUartMotorInfo } from '../../../../../types/BafangUartMotorTypes';
import { generateSimpleStringListItem } from '../../../../utils/UIUtils';
import i18n from '../../../../../i18n/i18n';

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
            generateSimpleStringListItem(
                i18n.t('serial_number'),
                info.serial_number,
            ),
            generateSimpleStringListItem(i18n.t('model_number'), info.model),
            generateSimpleStringListItem(
                i18n.t('manufacturer'),
                info.manufacturer,
            ),
            generateSimpleStringListItem(i18n.t('system_code'), info.system_code),
        ];
    }

    getVersionItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            generateSimpleStringListItem(
                i18n.t('software_version'),
                info.firmware_version,
            ),
            generateSimpleStringListItem(
                i18n.t('hardware_version'),
                info.hardware_version,
            ),
        ];
    }

    getElectricalParameterItems(): DescriptionsProps['items'] {
        const { connection } = this.props;
        const info = connection.getInfo();
        return [
            generateSimpleStringListItem(i18n.t('voltage'), info.voltage),
            generateSimpleStringListItem(i18n.t('max_current'), info.max_current),
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
                    {i18n.t('uart_main_tab_title')}
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title={i18n.t('uart_motor_codes')}
                    items={this.getCodeItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title={i18n.t('uart_motor_versions')}
                    items={this.getVersionItems()}
                    column={1}
                    style={{ marginBottom: '20px' }}
                />
                <Descriptions
                    bordered
                    title={i18n.t('electric_parameters')}
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
                            content: i18n.t('loading'),
                        });
                        setTimeout(() => {
                            const { lastUpdateTime } = this.state;
                            if (Date.now() - lastUpdateTime < 3000) {
                                message.open({
                                    key: 'loading',
                                    type: 'success',
                                    content: i18n.t('loaded_successfully'),
                                    duration: 2,
                                });
                            } else {
                                message.open({
                                    key: 'loading',
                                    type: 'error',
                                    content: i18n.t('loading_error'),
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
