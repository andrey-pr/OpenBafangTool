import React from 'react';
import {
    Typography,
    Descriptions,
    FloatButton,
    message,
    Popconfirm,
    Table,
    Button,
    TimePicker,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
    generateEditableNumberListItem,
    generateEditableStringListItem,
    generateSimpleBooleanListItem,
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanDisplayData1,
    BafangCanDisplayData2,
    BafangCanDisplayRealtimeData,
} from '../../../../../types/BafangCanSystemTypes';
import { getErrorCodeText } from '../../../../../constants/BafangCanConstants';
import NumberValueComponent from '../../../../components/NumberValueComponent';

const { Text } = Typography;

dayjs.extend(customParseFormat);

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = {
    data1: BafangCanDisplayData1 | null;
    data2: BafangCanDisplayData2 | null;
    realtime_data: BafangCanDisplayRealtimeData | null;
    error_codes: number[] | null;
    hardware_version: string | null;
    software_version: string | null;
    model_number: string | null;
    serial_number: string | null;
    customer_number: string | null;
    manufacturer: string | null;
    bootload_version: string | null;
    currentTimeToSet: dayjs.Dayjs | null;
};

const errorCodesTableLayout = [
    {
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Recommendations',
        dataIndex: 'recommendations',
        key: 'recommendations',
    },
];

/* eslint-disable camelcase */
class BafangCanDisplaySettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    private writingInProgress: boolean = false;

    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            data1: connection.display.data1,
            data2: connection.display.data2,
            realtime_data: connection.display.realtimeData,
            error_codes: connection.display.errorCodes,
            hardware_version: connection.display.hardwareVersion,
            software_version: connection.display.softwareVersion,
            model_number: connection.display.modelNumber,
            serial_number: connection.display.serialNumber,
            customer_number: connection.display.customerNumber,
            manufacturer: connection.display.manufacturer,
            bootload_version: connection.display.bootloaderVersion,
            currentTimeToSet: null,
        };
        this.getRecordsItems = this.getRecordsItems.bind(this);
        this.getRealtimeItems = this.getRealtimeItems.bind(this);
        this.getErrorCodeTableItems = this.getErrorCodeTableItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        connection.display.emitter.on(
            'data-0',
            (realtime_data: BafangCanDisplayRealtimeData) =>
                this.setState({ realtime_data }),
        );
        connection.display.emitter.on(
            'data-1',
            (data1: BafangCanDisplayData1) => this.setState({ data1 }),
        );
        connection.display.emitter.on(
            'data-2',
            (data2: BafangCanDisplayData2) => this.setState({ data2 }),
        );
        connection.display.emitter.on('data-ec', (error_codes: number[]) =>
            this.setState({ error_codes }),
        );
        connection.display.emitter.on('data-hv', (hardware_version: string) =>
            this.setState({ hardware_version }),
        );
        connection.display.emitter.on('data-sv', (software_version: string) =>
            this.setState({ software_version }),
        );
        connection.display.emitter.on('data-mn', (model_number: string) =>
            this.setState({ model_number }),
        );
        connection.display.emitter.on('data-sn', (serial_number: string) =>
            this.setState({ serial_number }),
        );
        connection.display.emitter.on('data-cn', (customer_number: string) =>
            this.setState({ customer_number }),
        );
        connection.display.emitter.on('data-m', (manufacturer: string) =>
            this.setState({ manufacturer }),
        );
        connection.display.emitter.on('data-bv', (bootload_version: string) =>
            this.setState({ bootload_version }),
        );
    }

    getRecordsItems(): DescriptionsProps['items'] {
        const { data1, data2 } = this.state;
        let items: DescriptionsProps['items'] = [];
        if (data1) {
            items = [
                ...items,
                generateEditableNumberListItem(
                    'Total mileage',
                    data1.total_mileage,
                    (e) => {
                        const { data1 } = this.state;
                        if (!data1) return;
                        data1.total_mileage = e;
                        this.setState({
                            data1,
                        });
                    },
                    'Km',
                    0,
                    1000000,
                ),
                generateEditableNumberListItem(
                    'Single trip mileage',
                    data1.single_mileage,
                    (e) => {
                        const { data1 } = this.state;
                        if (!data1) return;
                        data1.single_mileage = e;
                        this.setState({
                            data1,
                        });
                    },
                    'Km',
                    0,
                    (data1.total_mileage as number) + 1,
                ),
                generateSimpleNumberListItem(
                    'Max registered speed',
                    data1.max_speed,
                    'Km/H',
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Total mileage',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Single mileage',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Max registered speed',
                    'Not available yet',
                ),
            ];
        }
        if (data2) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    'Average speed',
                    data2.average_speed,
                    'Km/H',
                ),
                {
                    key: 'service_mileage',
                    label: 'Mileage since last service',
                    children: (
                        <>
                            <NumberValueComponent
                                value={data2.service_mileage}
                                unit="Km"
                            />
                            <br />
                            <br />
                            <Popconfirm // TODO create separate component
                                title="Erase service mileage"
                                description="Are you sure to clean mileage since last service record?"
                                onConfirm={() => {
                                    message.open({
                                        key: 'cleaning_service_mileage',
                                        type: 'loading',
                                        content: 'Cleaning mileage...',
                                    });
                                    this.props.connection.display
                                        .cleanServiceMileage()
                                        .then((success) => {
                                            if (success) {
                                                message.open({
                                                    key: 'cleaning_service_mileage',
                                                    type: 'success',
                                                    content:
                                                        'Cleaned sucessfully!',
                                                    duration: 2,
                                                });
                                            } else {
                                                message.open({
                                                    key: 'cleaning_service_mileage',
                                                    type: 'error',
                                                    content:
                                                        'Error during cleaning!',
                                                    duration: 2,
                                                });
                                            }
                                        })
                                        .catch(() => {
                                            message.open({
                                                key: 'cleaning_service_mileage',
                                                type: 'error',
                                                content:
                                                    'Error during cleaning!',
                                                duration: 2,
                                            });
                                        });
                                }}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="primary">Erase record</Button>
                            </Popconfirm>
                        </>
                    ),
                },
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    'Average speed',
                    'Not available yet',
                ),
                generateSimpleStringListItem(
                    'Mileage since last service',
                    'Not available yet',
                ),
            ];
        }
        return [
            ...items,
            {
                key: 'current_time',
                label: 'Set current time',
                children: (
                    <>
                        <TimePicker
                            onChange={(time: dayjs.Dayjs | null) =>
                                this.setState({ currentTimeToSet: time })
                            }
                        />
                        <br />
                        <br />
                        <Popconfirm
                            title="Set new time on display"
                            description="Are you sure to set new time on display clock?"
                            onConfirm={() => {
                                if (this.state.currentTimeToSet === null) {
                                    message.error(
                                        'Time in input form is not chosen',
                                    );
                                    return;
                                }
                                message.open({
                                    key: 'setting_time',
                                    type: 'loading',
                                    content: 'Setting time...',
                                });
                                this.props.connection.display
                                    .setTime(
                                        this.state.currentTimeToSet.hour(),
                                        this.state.currentTimeToSet.minute(),
                                        this.state.currentTimeToSet.second(),
                                    )
                                    .then((success) => {
                                        if (success) {
                                            message.open({
                                                key: 'setting_time',
                                                type: 'success',
                                                content: 'Set sucessfully!',
                                                duration: 2,
                                            });
                                        } else {
                                            message.open({
                                                key: 'setting_time',
                                                type: 'error',
                                                content:
                                                    'Error during setting!',
                                                duration: 2,
                                            });
                                        }
                                    });
                            }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary">Set time on display</Button>
                        </Popconfirm>
                    </>
                ),
            },
        ];
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        const { realtime_data } = this.state;
        if (!realtime_data) return [];
        return [
            generateSimpleNumberListItem(
                'Assist levels number',
                realtime_data.assist_levels,
            ),
            generateSimpleBooleanListItem(
                'Mode',
                realtime_data.ride_mode,
                'SPORT',
                'ECO',
            ),
            generateSimpleBooleanListItem(
                'Boost',
                realtime_data.boost,
                'ON',
                'OFF',
            ),
            generateSimpleStringListItem(
                'Current assist',
                realtime_data.current_assist_level,
            ),
            generateSimpleBooleanListItem(
                'Light',
                realtime_data.light,
                'ON',
                'OFF',
            ),
            generateSimpleBooleanListItem(
                'Button',
                realtime_data.button,
                'Pressed',
                'Not pressed',
            ),
        ];
    }

    getErrorCodeTableItems(): {
        key: string;
        code: number;
        description: string;
        recommendations: string;
    }[] {
        if (!this.state.error_codes) return [];
        let i: number = 0;
        return this.state.error_codes.map((code: number) => {
            return {
                key: `${i++}`,
                code,
                ...getErrorCodeText(code),
            };
        });
    }

    getOtherItems(): DescriptionsProps['items'] {
        const { serial_number, customer_number, manufacturer } = this.state;
        return [
            generateSimpleStringListItem(
                'Serial number',
                serial_number,
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
            generateEditableStringListItem('Manufacturer', manufacturer, (e) =>
                this.setState({
                    manufacturer: e,
                }),
            ),
            generateEditableStringListItem(
                'Customer number',
                customer_number,
                (e) =>
                    this.setState({
                        customer_number: e,
                    }),
            ),
            generateSimpleStringListItem(
                'Bootloader version',
                this.state.bootload_version,
            ),
        ];
    }

    saveParameters(): void {
        if (this.writingInProgress) return;
        this.writingInProgress = true;
        const { connection } = this.props;
        if (this.state.data1) {
            connection.display.totalMileage = this.state.data1.total_mileage;
            connection.display.singleMileage = this.state.data1.single_mileage;
        }
        connection.display.customerNumber = this.state.customer_number;
        connection.display.manufacturer = this.state.manufacturer;
        connection.display.saveData();
        message.open({
            key: 'writing',
            type: 'loading',
            content: 'Writing...',
            duration: 60,
        });
        connection.display.emitter.once(
            'write-finish',
            (readedSuccessfully, readededUnsuccessfully) => {
                message.open({
                    key: 'writing',
                    type: 'info',
                    content: `Wrote ${readedSuccessfully} parameters succesfully, ${readededUnsuccessfully} not succesfully`,
                    duration: 5,
                });
                this.writingInProgress = false;
            },
        );
    }

    render() {
        const { connection } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <Typography.Title level={2} style={{ margin: 0 }}>
                    Display settings
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title="Records"
                    items={this.getRecordsItems()}
                    column={1}
                />
                {this.state.realtime_data && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title="State"
                            items={this.getRealtimeItems()}
                            column={1}
                        />
                    </>
                )}
                {!this.state.realtime_data && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Real-time data from display is not received yet
                            </Text>
                        </div>
                    </>
                )}
                {this.state.error_codes && (
                    <>
                        <br />
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            Error codes
                        </Typography.Title>
                        <br />
                        <Table
                            dataSource={this.getErrorCodeTableItems()}
                            columns={errorCodesTableLayout}
                            pagination={false}
                            bordered
                        />
                    </>
                )}
                {!this.state.error_codes && (
                    <>
                        <br />
                        <div style={{ marginBottom: '15px' }}>
                            <Text type="danger">
                                Display does not have available to read error
                                code storage
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
                        connection.display.loadData();
                        message.open({
                            key: 'loading',
                            type: 'loading',
                            content: 'Loading...',
                            duration: 60,
                        });
                        connection.display.emitter.once(
                            'read-finish',
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
                <Popconfirm
                    title="Parameter writing"
                    description="Are you sure that you want to write all parameters on device?"
                    onConfirm={this.saveParameters}
                    okText="Yes"
                    cancelText="No"
                >
                    <FloatButton
                        icon={<DeliveredProcedureOutlined />}
                        type="primary"
                        style={{ right: 24 }}
                    />
                </Popconfirm>
            </div>
        );
    }
}

export default BafangCanDisplaySettingsView;
