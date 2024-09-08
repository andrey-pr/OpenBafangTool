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
import i18n, { getTimePickerLocale } from '../../../../../i18n/i18n';

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
        title: i18n.t('code'),
        dataIndex: 'code',
        key: 'code',
    },
    {
        title: i18n.t('description'),
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: i18n.t('recommendations'),
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
                    i18n.t('total_mileage'),
                    data1.total_mileage,
                    (e) => {
                        const { data1 } = this.state;
                        if (!data1) return;
                        data1.total_mileage = e;
                        this.setState({
                            data1,
                        });
                    },
                    i18n.t('km'),
                    0,
                    1000000,
                ),
                generateEditableNumberListItem(
                    i18n.t('single_trip_mileage'),
                    data1.single_mileage,
                    (e) => {
                        const { data1 } = this.state;
                        if (!data1) return;
                        data1.single_mileage = e;
                        this.setState({
                            data1,
                        });
                    },
                    i18n.t('km'),
                    0,
                    (data1.total_mileage as number) + 1,
                ),
                generateSimpleNumberListItem(
                    i18n.t('max_registered_speed'),
                    data1.max_speed,
                    i18n.t('km/h'),
                ),
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    i18n.t('total_mileage'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('single_trip_mileage'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('max_registered_speed'),
                    i18n.t('parameter_not_available_yet'),
                ),
            ];
        }
        if (data2) {
            items = [
                ...items,
                generateSimpleNumberListItem(
                    i18n.t('average_speed'),
                    data2.average_speed,
                    i18n.t('km/h'),
                ),
                {
                    key: 'service_mileage',
                    label: i18n.t('mileage_since_last_service'),
                    children: (
                        <>
                            <NumberValueComponent
                                value={data2.service_mileage}
                                unit={i18n.t('km')}
                            />
                            <br />
                            <br />
                            <Popconfirm // TODO create separate component
                                title={i18n.t('erase_service_mileage_title')}
                                description={i18n.t(
                                    'erase_service_mileage_confirm',
                                )}
                                onConfirm={() => {
                                    message.open({
                                        key: 'cleaning_service_mileage',
                                        type: 'loading',
                                        content: i18n.t('cleaning_mileage'),
                                    });
                                    this.props.connection.display
                                        .cleanServiceMileage()
                                        .then((success) => {
                                            if (success) {
                                                message.open({
                                                    key: 'cleaning_service_mileage',
                                                    type: 'success',
                                                    content: i18n.t(
                                                        'cleaned_successfully',
                                                    ),
                                                    duration: 2,
                                                });
                                            } else {
                                                message.open({
                                                    key: 'cleaning_service_mileage',
                                                    type: 'error',
                                                    content:
                                                        i18n.t(
                                                            'cleaning_error',
                                                        ),
                                                    duration: 2,
                                                });
                                            }
                                        })
                                        .catch(() => {
                                            message.open({
                                                key: 'cleaning_service_mileage',
                                                type: 'error',
                                                content:
                                                    i18n.t('cleaning_error'),
                                                duration: 2,
                                            });
                                        });
                                }}
                                okText={i18n.t('yes')}
                                cancelText={i18n.t('no')}
                            >
                                <Button type="primary">
                                    {i18n.t('erase_record')}
                                </Button>
                            </Popconfirm>
                        </>
                    ),
                },
            ];
        } else {
            items = [
                ...items,
                generateSimpleStringListItem(
                    i18n.t('average_speed'),
                    i18n.t('parameter_not_available_yet'),
                ),
                generateSimpleStringListItem(
                    i18n.t('mileage_since_last_service'),
                    i18n.t('parameter_not_available_yet'),
                ),
            ];
        }
        return [
            ...items,
            {
                key: 'current_time',
                label: i18n.t('set_time'),
                children: (
                    <>
                        <TimePicker
                            onChange={(time: dayjs.Dayjs | null) =>
                                this.setState({ currentTimeToSet: time })
                            }
                            locale={getTimePickerLocale()}
                        />
                        <br />
                        <br />
                        <Popconfirm
                            title={i18n.t('set_time_title')}
                            description={i18n.t('set_time_confirm')}
                            onConfirm={() => {
                                if (this.state.currentTimeToSet === null) {
                                    message.error(i18n.t('time_not_chosen'));
                                    return;
                                }
                                message.open({
                                    key: 'setting_time',
                                    type: 'loading',
                                    content: i18n.t('setting_time'),
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
                                                content:
                                                    i18n.t('set_successfully'),
                                                duration: 2,
                                            });
                                        } else {
                                            message.open({
                                                key: 'setting_time',
                                                type: 'error',
                                                content:
                                                    i18n.t('setting_error'),
                                                duration: 2,
                                            });
                                        }
                                    });
                            }}
                            okText={i18n.t('yes')}
                            cancelText={i18n.t('no')}
                        >
                            <Button type="primary">
                                {i18n.t('set_time_button')}
                            </Button>
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
                i18n.t('total_assist_levels_number'),
                realtime_data.assist_levels,
            ),
            generateSimpleBooleanListItem(
                i18n.t('mode'),
                realtime_data.ride_mode,
                i18n.t('sport_mode'),
                i18n.t('eco_mode'),
            ),
            generateSimpleBooleanListItem(
                i18n.t('boost'),
                realtime_data.boost,
                i18n.t('on'),
                i18n.t('off'),
            ),
            generateSimpleStringListItem(
                i18n.t('current_assist_level'),
                realtime_data.current_assist_level,
            ),
            generateSimpleBooleanListItem(
                i18n.t('light'),
                realtime_data.light,
                i18n.t('on'),
                i18n.t('off'),
            ),
            generateSimpleBooleanListItem(
                i18n.t('button_pressed'),
                realtime_data.button,
                i18n.t('pressed'),
                i18n.t('not_pressed'),
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
                i18n.t('serial_number'),
                serial_number,
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
            generateEditableStringListItem(
                i18n.t('manufacturer'),
                manufacturer,
                (e) =>
                    this.setState({
                        manufacturer: e,
                    }),
            ),
            generateEditableStringListItem(
                i18n.t('customer_number'),
                customer_number,
                (e) =>
                    this.setState({
                        customer_number: e,
                    }),
            ),
            generateSimpleStringListItem(
                i18n.t('bootloader_version'),
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
            content: i18n.t('writing'),
            duration: 60,
        });
        connection.display.emitter.once(
            'write-finish',
            (wroteSuccessfully, wroteUnsuccessfully) => {
                message.open({
                    key: 'writing',
                    type: 'info',
                    content: i18n.t('wrote_x_parameters', {
                        successfully: wroteSuccessfully,
                        nonSuccessfully: wroteUnsuccessfully,
                    }),
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
                    {i18n.t('display')}
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title={i18n.t('records_title')}
                    items={this.getRecordsItems()}
                    column={1}
                />
                {this.state.realtime_data && (
                    <>
                        <br />
                        <Descriptions
                            bordered
                            title={i18n.t('state_title')}
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
                            {i18n.t('error_codes_title')}
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
                    title={i18n.t('version_list_title')}
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
                            content: i18n.t('loading'),
                            duration: 60,
                        });
                        connection.display.emitter.once(
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
                <Popconfirm
                    title={i18n.t('parameter_writing_title')}
                    description={i18n.t('parameter_writing_confirm')}
                    onConfirm={this.saveParameters}
                    okText={i18n.t('yes')}
                    cancelText={i18n.t('no')}
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
