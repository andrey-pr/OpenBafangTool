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
    BafangCanBatteryStateData,
} from '../../../../../types/BafangCanSystemTypes';
import i18n from '../../../../../i18n/i18n';

const { Text } = Typography;

type ViewProps = {
    connection: BafangCanSystem;
};

type ViewState = {
    cells_voltage: number[] | null;
    capacity_data: BafangCanBatteryCapacityData | null;
    state: BafangCanBatteryStateData | null;
    hardware_version: string | null;
    software_version: string | null;
    model_number: string | null;
    serial_number: string | null;
};

/* eslint-disable camelcase */
class BafangCanBatteryView extends React.Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            cells_voltage: connection.battery.cellsVoltage,
            capacity_data: connection.battery.capacityData,
            state: connection.battery.stateData,
            hardware_version: connection.battery.hardwareVersion,
            software_version: connection.battery.softwareVersion,
            model_number: connection.battery.modelNumber,
            serial_number: connection.battery.serialNumber,
        };
        connection.battery.emitter.on('data-cells', (cells_voltage: number[]) =>
            this.setState({ cells_voltage }),
        );
        connection.battery.emitter.on(
            'data-0',
            (capacity_data: BafangCanBatteryCapacityData) =>
                this.setState({ capacity_data }),
        );
        connection.battery.emitter.on(
            'data-1',
            (state: BafangCanBatteryStateData) => this.setState({ state }),
        );
        connection.battery.emitter.on('data-hv', (hardware_version: string) =>
            this.setState({ hardware_version }),
        );
        connection.battery.emitter.on('data-sv', (software_version: string) =>
            this.setState({ software_version }),
        );
        connection.battery.emitter.on('data-mn', (model_number: string) =>
            this.setState({ model_number }),
        );
        connection.battery.emitter.on('data-sn', (serial_number: string) =>
            this.setState({ serial_number }),
        );
    }

    getCellVoltageItems(): DescriptionsProps['items'] {
        if (!this.state.cells_voltage) return [];
        let items: DescriptionsProps['items'] = [];
        this.state.cells_voltage.forEach((voltage, cell) => {
            items?.push(
                generateSimpleNumberMulticolumnListItem(
                    i18n.t('cell', { number: cell + 1 }),
                    voltage,
                    i18n.t('v'),
                ),
            );
        });
        return items;
    }

    getCapacityItems(): DescriptionsProps['items'] {
        const { capacity_data } = this.state;
        if (capacity_data) {
            return [
                generateSimpleNumberListItem(
                    i18n.t('full_capacity'),
                    capacity_data.full_capacity,
                    i18n.t('mah'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('capacity_left'),
                    capacity_data.capacity_left,
                    i18n.t('mah'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('rsoc'),
                    capacity_data.rsoc,
                    '%',
                ),
                generateSimpleNumberListItem(
                    i18n.t('asoc'),
                    capacity_data.asoc,
                    '%',
                ),
                generateSimpleNumberListItem(
                    i18n.t('soh'),
                    capacity_data.soh,
                    '%',
                ),
            ];
        }
    }

    getCurrentStateItems(): DescriptionsProps['items'] {
        const { state } = this.state;
        if (state) {
            return [
                generateSimpleNumberListItem(
                    i18n.t('voltage'),
                    state.voltage,
                    i18n.t('v'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('current'),
                    state.current,
                    i18n.t('a'),
                ),
                generateSimpleNumberListItem(
                    i18n.t('temperature'),
                    state.temperature,
                    i18n.t('c_degree'),
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
                    {i18n.t('battery')}
                </Typography.Title>
                {this.state.cells_voltage && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('cell_voltage_array_title')}
                            items={this.getCellVoltageItems()}
                            column={2}
                        />
                    </>
                )}
                {!this.state.cells_voltage && (
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
                {this.state.capacity_data && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('capacity_info')}
                            items={this.getCapacityItems()}
                            column={1}
                        />
                    </>
                )}
                {!this.state.capacity_data && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Data about battery capacity is not received yet
                            </Text>
                        </div>
                    </>
                )}
                {this.state.state && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('current_state')}
                            items={this.getCurrentStateItems()}
                            column={1}
                        />
                    </>
                )}
                {!this.state.state && (
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
                    title={i18n.t('version_list_title')}
                    items={this.getOtherItems()}
                    column={1}
                />
                <FloatButton
                    icon={<SyncOutlined />}
                    type="primary"
                    style={{ right: 24 }}
                    onClick={() => {
                        connection.battery.loadData();
                        message.open({
                            key: 'loading',
                            type: 'loading',
                            content: i18n.t('loading'),
                            duration: 60,
                        });
                        connection.battery.emitter.once(
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

export default BafangCanBatteryView;
