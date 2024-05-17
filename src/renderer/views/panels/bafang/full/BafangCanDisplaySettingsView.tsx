import React from 'react';
import {
    Typography,
    Descriptions,
    FloatButton,
    message,
    Button,
    TimePicker,
    Popconfirm,
    Table,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import NumberValueComponent from '../../../components/NumberValueComponent';
import {
    generateEditableNumberListItem,
    generateEditableStringListItem,
    generateSimpleBooleanListItem,
    generateSimpleNumberListItem,
    generateSimpleStringListItem,
} from '../../../../utils/UIUtils';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
} from '../../../../../types/BafangCanSystemTypes';
import { getErrorCodeText } from '../../../../../constants/BafangCanConstants';

dayjs.extend(customParseFormat);

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanDisplayData &
    BafangCanDisplayState &
    BafangCanDisplayCodes & {
        display_error_codes: number[];
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

// TODO add redux
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
            ...connection.displayData,
            ...connection.displayRealtimeData,
            ...connection.displayCodes,
            display_error_codes: connection.displayErrorCodes,
            currentTimeToSet: null,
        };
        this.getRecordsItems = this.getRecordsItems.bind(this);
        this.getStateItems = this.getStateItems.bind(this);
        this.getErrorCodeTableItems = this.getErrorCodeTableItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('display-general-data', this.updateData);
        connection.emitter.on('display-error-codes', (errors: number[]) =>
            this.setState({ display_error_codes: errors }),
        );
        connection.emitter.on('display-codes-data', this.updateData);
        connection.emitter.on('broadcast-data-display', this.updateData);
    }

    updateData(values: any) {
        // TODO add property check
        this.setState(values);
    }

    getRecordsItems(): DescriptionsProps['items'] {
        const {
            display_total_mileage,
            display_single_mileage,
            display_service_mileage,
        } = this.state;
        return [
            generateEditableNumberListItem(
                'Total mileage',
                display_total_mileage,
                (e) =>
                    this.setState({
                        display_total_mileage: e,
                    }),
                'Km',
                0,
                1000000,
            ),
            generateEditableNumberListItem(
                'Single trip mileage',
                display_single_mileage,
                (e) =>
                    this.setState({
                        display_single_mileage: e,
                    }),
                'Km',
                0,
                display_total_mileage as number,
            ),
            generateSimpleNumberListItem(
                'Max registered speed',
                this.state.display_max_speed,
                'Km/H',
            ),
            generateSimpleNumberListItem(
                'Average speed',
                this.state.display_average_speed,
                'Km/H',
            ),
            {
                key: 'display_service_mileage',
                label: 'Mileage since last service',
                children: (
                    <>
                        <NumberValueComponent
                            value={display_service_mileage}
                            unit="Km"
                        />
                        <br />
                        <br />
                        <Popconfirm
                            title="Erase service mileage"
                            description={`Are you sure to clean mileage since last service record?`}
                            onConfirm={() => {
                                message.open({
                                    key: 'cleaning_service_mileage',
                                    type: 'loading',
                                    content: 'Cleaning mileage...',
                                });
                                this.props.connection
                                    .cleanDisplayServiceMileage()
                                    .then((success) => {
                                        if (success) {
                                            message.open({
                                                key: 'cleaning_service_mileage',
                                                type: 'success',
                                                content: 'Cleaned sucessfully!',
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
                                            content: 'Error during cleaning!',
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
            {
                key: 'display_current_time',
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
                            description={`Are you sure to set new time on display clock?`}
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
                                this.props.connection
                                    .setDisplayTime(
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

    getStateItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'Assist levels number',
                this.state.display_assist_levels,
            ),
            generateSimpleBooleanListItem(
                'Mode',
                this.state.display_ride_mode,
                'SPORT',
                'ECO',
            ),
            generateSimpleBooleanListItem(
                'Boost',
                this.state.display_boost,
                'ON',
                'OFF',
            ),
            generateSimpleStringListItem(
                'Current assist',
                this.state.display_current_assist_level,
            ),
            generateSimpleBooleanListItem(
                'Light',
                this.state.display_light,
                'ON',
                'OFF',
            ),
            generateSimpleBooleanListItem(
                'Button',
                this.state.display_button,
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
        let i: number = 0;
        return this.state.display_error_codes.map((code: number) => {
            return {
                key: `${i++}`,
                code,
                ...getErrorCodeText(code),
            };
        });
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            display_serial_number,
            display_customer_number,
            display_manufacturer,
        } = this.state;
        return [
            generateSimpleStringListItem(
                'Serial number',
                display_serial_number,
                'Please note, that serial number could be easily changed, so it should never be used for security',
            ),
            generateSimpleStringListItem(
                'Software version',
                this.state.display_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.display_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.display_model_number,
            ),
            generateEditableStringListItem(
                'Manufacturer',
                display_manufacturer,
                (e) =>
                    this.setState({
                        display_manufacturer: e,
                    }),
            ),
            generateEditableStringListItem(
                'Customer number',
                display_customer_number,
                (e) =>
                    this.setState({
                        display_customer_number: e,
                    }),
            ),
            generateSimpleStringListItem(
                'Bootloader version',
                this.state.display_bootload_version,
            ),
        ];
    }

    saveParameters(): void {
        if (this.writingInProgress) return;
        this.writingInProgress = true;
        const { connection } = this.props;
        connection.displayData = this.state as BafangCanDisplayData;
        connection.displayCodes = this.state as BafangCanDisplayCodes;
        connection.saveDisplayData();
        message.open({
            key: 'writing',
            type: 'loading',
            content: 'Writing...',
            duration: 60,
        });
        connection.emitter.once(
            'display-writing-finish',
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
                <br />
                <Descriptions
                    bordered
                    title="State"
                    items={this.getStateItems()}
                    column={1}
                />
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
                <Popconfirm
                    title="Parameter writing"
                    description={`Are you sure that you want to write all parameters on device?`}
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
