import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    generateEditableStringListItem,
    generateSimpleNumberListItem,
    generateSimpleNumberMulticolumnListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';

const { Text } = Typography;

type ViewProps = {
    connection: BafangCanSystem;
};

type ViewState = {};

// TODO add redux
/* eslint-disable camelcase */
class BafangCanBatteryView extends React.Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        const { connection } = this.props;
        this.state = {};
        this.getOtherItems = this.getOtherItems.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getCellVoltageItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberMulticolumnListItem('Cell 1', 4.08, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 2', 4.087, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 3', 4.087, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 4', 4.088, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 5', 4.088, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 6', 4.088, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 7', 4.088, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 8', 4.091, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 9', 4.092, 'V'),
            generateSimpleNumberMulticolumnListItem('Cell 10', 4.093, 'V'),
        ];
    }

    getCapacityItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem('Full capacity', 14481, 'mAh'),
            generateSimpleNumberListItem('Capacity left', 13512, 'mAh'),
            generateSimpleNumberListItem('RSOC', 93, '%'),
            generateSimpleNumberListItem('ASOC', 93, '%'),
            generateSimpleNumberListItem('SOH', 92, '%'),
        ];
    }

    getCurrentStateItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem('Current', 0, 'A'),
            generateSimpleNumberListItem('Voltage', 40.88, 'V'),
            generateSimpleNumberListItem('Temperature', 32, 'C°'),
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                'Serial number',
                '3C5HC20000331',
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem('Software version', '2.25'),
            generateSimpleStringListItem('Hardware version', '1.0'),
            generateSimpleStringListItem('Model number', 'ZZ1311005'),
        ];
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Battery
                </Typography.Title>
                {connection.isBatteryCellVoltageReady && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Cell voltage"
                            items={this.getCellVoltageItems()}
                            column={2}
                        />
                    </>
                )}
                {!connection.isBatteryCellVoltageReady && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Data about battery cell voltage is not received
                                yet
                            </Text>
                        </div>
                    </>
                )}
                {connection.isBatteryCapacityDataReady && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Capacity info"
                            items={this.getCapacityItems()}
                            column={1}
                        />
                    </>
                )}
                {!connection.isBatteryCapacityDataReady && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Data about battery capacity is not received yet
                            </Text>
                        </div>
                    </>
                )}
                {connection.isBatteryCurrentStateDataReady && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="Current state"
                            items={this.getCurrentStateItems()}
                            column={1}
                        />
                    </>
                )}
                {!connection.isBatteryCurrentStateDataReady && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Realtime data about current state is not
                                received yet
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
                    style={{ right: 94 }}
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

export default BafangCanBatteryView;
