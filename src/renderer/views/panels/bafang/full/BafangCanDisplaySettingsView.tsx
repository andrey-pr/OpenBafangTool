import React from 'react';
import {
    Typography,
    Descriptions,
    FloatButton,
    message,
    Button,
    TimePicker,
    Popconfirm,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import StringInputComponent from '../../../components/StringInput';
import BafangCanSystem from '../../../../device/BafangCanSystem';
import {
    BafangCanDisplayCodes,
    BafangCanDisplayData,
    BafangCanDisplayState,
} from '../../../../device/BafangCanSystemTypes';
import ParameterInputComponent from '../../../components/ParameterInput';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import NumberValueComponent from '../../../components/NumberValueComponent';
import BooleanValueComponent from '../../../components/BooleanValueComponent';
import StringValueComponent from '../../../components/StringValueComponent';

dayjs.extend(customParseFormat);

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanDisplayData &
    BafangCanDisplayState &
    BafangCanDisplayCodes & {
        currentTimeToSet: dayjs.Dayjs | null;
    };

/* eslint-disable camelcase */
class BafangCanDisplaySettingsView extends React.Component<
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.getDisplayData(),
            ...connection.getDisplayState(),
            ...connection.getDisplayCodes(),
            currentTimeToSet: null,
        };
        this.getRecordsItems = this.getRecordsItems.bind(this);
        this.getStateItems = this.getStateItems.bind(this);
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateRealtimeData = this.updateRealtimeData.bind(this);
        connection.emitter.on('display-general-data', (data: BafangCanDisplayData) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('display-state-data', (data: BafangCanDisplayState) =>
            this.setState({ ...data }),
        );
        connection.emitter.on('display-codes-data', (data: BafangCanDisplayCodes) =>
            this.setState({ ...data }),
        );
        connection.emitter.on(
            'broadcast-data-display',
            this.updateRealtimeData,
        );
    }

    getRecordsItems(): DescriptionsProps['items'] {
        const {
            display_total_mileage,
            display_single_mileage,
            display_max_speed,
            display_average_speed,
            display_service_mileage,
        } = this.state;
        return [
            {
                key: 'total_mileage',
                label: 'Total mileage',
                children: (
                    <ParameterInputComponent
                        value={display_total_mileage}
                        unit="Km"
                        min={0}
                        max={1000000}
                        onNewValue={(e) => {
                            this.setState({
                                display_total_mileage: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'single_mileage',
                label: 'Single trip mileage',
                children: (
                    <ParameterInputComponent
                        value={display_single_mileage}
                        unit="Km"
                        min={0}
                        max={display_total_mileage as number}
                        decimalPlaces={1}
                        onNewValue={(e) => {
                            this.setState({
                                display_single_mileage: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'max_speed',
                label: 'Speed record',
                children: (
                    <NumberValueComponent
                        value={display_max_speed}
                        unit="Km/H"
                    />
                ),
            },
            {
                key: 'average_speed',
                label: 'Average speed',
                children: (
                    <NumberValueComponent
                        value={display_average_speed}
                        unit="Km/H"
                    />
                ),
            },
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
        const {
            display_assist_levels,
            display_ride_mode,
            display_boost,
            display_current_assist_level,
            display_light,
            display_button,
        } = this.state;
        return [
            {
                key: 'total_assist_levels',
                label: 'Total assist level number',
                children: (
                    <NumberValueComponent value={display_assist_levels} />
                ),
            },
            {
                key: 'ride_mode',
                label: 'Ride mode',
                children: <NumberValueComponent value={display_ride_mode} />,
            },
            {
                key: 'boost',
                label: 'Boost',
                children: (
                    <BooleanValueComponent
                        value={display_boost}
                        textTrue="On"
                        textFalse="Off"
                    />
                ),
            },
            {
                key: 'current_assist_level',
                label: 'Current assist level',
                children: <StringValueComponent value={`${display_current_assist_level}`}/>,
            },
            {
                key: 'light',
                label: 'Light',
                children: (
                    <BooleanValueComponent
                        value={display_light}
                        textTrue="On"
                        textFalse="Off"
                    />
                ),
            },
            {
                key: 'button_pressed',
                label: 'Button pressed',
                children: (
                    <BooleanValueComponent
                        value={display_button}
                        textTrue="Pressed"
                        textFalse="Not pressed"
                    />
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            display_serial_number,
            display_bootload_version,
            display_customer_number,
            display_hardware_version,
            display_manufacturer,
            display_model_number,
            display_software_version,
        } = this.state;
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_serial_number}
                        onNewValue={(e) => {
                            this.setState({
                                display_serial_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'software_version',
                label: 'Software version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_software_version}
                        onNewValue={(e) => {
                            this.setState({
                                display_software_version: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'hardware_version',
                label: 'Hardware version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_hardware_version}
                        onNewValue={(e) => {
                            this.setState({
                                display_hardware_version: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'model_number',
                label: 'Model number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_model_number}
                        onNewValue={(e) => {
                            this.setState({
                                display_model_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_manufacturer}
                        onNewValue={(e) => {
                            this.setState({
                                display_manufacturer: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'customer_number',
                label: 'Customer number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_customer_number}
                        onNewValue={(e) => {
                            this.setState({
                                display_customer_number: e,
                            });
                        }}
                    />
                ),
            },
            {
                key: 'bootloader_version',
                label: 'Bootloader version',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={display_bootload_version}
                        onNewValue={(e) => {
                            this.setState({
                                display_bootload_version: e,
                            });
                        }}
                    />
                ),
            },
        ];
    }

    updateRealtimeData(variables: any): void {
        this.setState({ ...variables });
    }

    saveParameters(): void {
        const { connection } = this.props;
        connection.saveData();
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
                            // if (Date.now() - lastUpdateTime < 3000) {
                            //     message.open({
                            //         key: 'loading',
                            //         type: 'success',
                            //         content: 'Read sucessfully!',
                            //         duration: 2,
                            //     });
                            // } else {
                            //     message.open({
                            //         key: 'loading',
                            //         type: 'error',
                            //         content: 'Error during reading!',
                            //         duration: 2,
                            //     });
                            // }
                        }, 3000);
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
