import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    generateSimpleNumberListItem,
    generateSimpleNumberMulticolumnListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import {
    BafangCanBatteryCapacityData,
    BafangCanBatteryCodes,
    BafangCanBatteryStateData,
} from '../../../../../types/BafangCanSystemTypes';

const { Text } = Typography;

type ViewProps = {
    connection: BafangCanSystem;
};

type ViewState = BafangCanBatteryCodes & {
    cells_voltage: number[];
    capacity_data: BafangCanBatteryCapacityData;
    state: BafangCanBatteryStateData;
};

// TODO add redux
/* eslint-disable camelcase */
class BafangCanBatteryView extends React.Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            cells_voltage: connection.batteryCellsVoltage,
            capacity_data: connection.batteryCapacityData,
            state: connection.batteryStateData,
            ...connection.batteryCodes,
        };
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('battery-codes-data', this.updateData);
        connection.emitter.on('battery-cells-data', (cells_voltage: number[]) =>
            this.setState({ cells_voltage }),
        );
        connection.emitter.on(
            'battery-capacity-data',
            (capacity_data: BafangCanBatteryCapacityData) =>
                this.setState({ capacity_data }),
        );
        connection.emitter.on(
            'battery-state-data',
            (state: BafangCanBatteryStateData) => this.setState({ state }),
        );
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getCellVoltageItems(): DescriptionsProps['items'] {
        let items: DescriptionsProps['items'] = [];
        this.state.cells_voltage.forEach((voltage, cell) => {
            items?.push(
                generateSimpleNumberMulticolumnListItem(
                    `Cell ${cell + 1}`,
                    voltage,
                    'V',
                ),
            );
        });
        return items;
    }

    getCapacityItems(): DescriptionsProps['items'] {
        const { capacity_data } = this.state;
        return [
            generateSimpleNumberListItem(
                'Full capacity',
                capacity_data.full_capacity,
                'mAh',
            ),
            generateSimpleNumberListItem(
                'Capacity left',
                capacity_data.capacity_left,
                'mAh',
            ),
            generateSimpleNumberListItem('RSOC', capacity_data.rsoc, '%'),
            generateSimpleNumberListItem('ASOC', capacity_data.asoc, '%'),
            generateSimpleNumberListItem('SOH', capacity_data.soh, '%'),
        ];
    }

    getCurrentStateItems(): DescriptionsProps['items'] {
        const { state } = this.state;
        return [
            generateSimpleNumberListItem('Voltage', state.voltage, 'V'),
            generateSimpleNumberListItem('Current', state.current, 'A'),
            generateSimpleNumberListItem(
                'Temperature',
                state.temperature,
                'C°',
            ),
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        return [
            generateSimpleStringListItem(
                'Serial number',
                this.state.battery_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.battery_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.battery_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.battery_model_number,
            ),
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
