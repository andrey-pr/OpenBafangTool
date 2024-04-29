import React from 'react';
import { Typography, Descriptions, FloatButton, message } from 'antd';
import type { DescriptionsProps } from 'antd';
import { SyncOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import StringInputComponent from '../../../components/StringInput';
import BafangCanSystem from '../../../../../device/high-level/BafangCanSystem';
import {
    BafangCanControllerCodes,
    BafangCanControllerRealtime,
    BafangCanControllerSpeedParameters,
    BafangCanWheelDiameterTable,
} from '../../../../../types/BafangCanSystemTypes';
import { NotAvailable, NotLoadedYet } from '../../../../../types/no_data';
import ParameterInputComponent from '../../../components/ParameterInput';
import ParameterSelectComponent from '../../../components/ParameterSelect';
import { generateSimpleNumberListItem, generateSimpleStringListItem } from '../../../../utils/UIUtils';

type SettingsProps = {
    connection: BafangCanSystem;
};

type SettingsState = BafangCanControllerRealtime &
    BafangCanControllerSpeedParameters &
    BafangCanControllerCodes;

//TODO add redux
/* eslint-disable camelcase */
class BafangCanMotorSettingsView extends React.Component<
    //TODO add param1
    SettingsProps,
    SettingsState
> {
    constructor(props: SettingsProps) {
        super(props);
        const { connection } = this.props;
        this.state = {
            ...connection.controllerSpeedParameters,
            ...connection.controllerCodes,
            ...connection.controllerRealtimeData,
        };
        this.getOtherItems = this.getOtherItems.bind(this);
        this.saveParameters = this.saveParameters.bind(this);
        this.updateData = this.updateData.bind(this);
        connection.emitter.on('controller-speed-data', this.updateData);
        connection.emitter.on('controller-codes-data', this.updateData);
        connection.emitter.on('broadcast-data-controller', this.updateData);
    }

    updateData(values: any) {
        //TODO add property check
        this.setState({ ...values });
    }

    getRealtimeItems(): DescriptionsProps['items'] {
        return [
            generateSimpleNumberListItem(
                'Remaining capacity',
                this.state.controller_remaining_capacity,
                'mAh',
            ),
            generateSimpleNumberListItem(
                'Remaining trip distance',
                this.state.controller_remaining_distance,
                'Km',
            ),
            generateSimpleNumberListItem(
                'Last trip distance',
                this.state.controller_single_trip,
                'Km',
            ),
            generateSimpleNumberListItem(
                'Cadence',
                this.state.controller_cadence,
                'RPM',
            ),
            generateSimpleNumberListItem(
                'Torque value',
                this.state.controller_torque,
                'mV',
            ),
            generateSimpleNumberListItem(
                'Voltage',
                this.state.controller_voltage,
                'V',
            ),
            generateSimpleNumberListItem(
                'Controller temperature',
                this.state.controller_temperature,
                'C°',
            ),
            generateSimpleNumberListItem(
                'Motor temperature',
                this.state.controller_motor_temperature,
                'C°',
            ),
            generateSimpleNumberListItem(
                'Current',
                this.state.controller_current,
                'A',
            ),
            generateSimpleNumberListItem(
                'Speed',
                this.state.controller_speed,
                'Km/H',
            ),
        ];
    }

    getSpeedItems(): DescriptionsProps['items'] {
        const {
            controller_speed_limit,
            controller_wheel_diameter,
            controller_circumference,
        } = this.state;
        return [
            {
                key: 'speed_limit',
                label: 'Speed limit',
                children: (
                    <ParameterInputComponent
                        value={controller_speed_limit}
                        unit="km/h"
                        min={1}
                        max={60}
                        onNewValue={(e) => {
                            this.setState({ controller_speed_limit: e });
                        }}
                        warningText="Its illegal in most countries to set speed limit bigger than 25km/h"
                        warningBelow={0}
                        warningAbove={25}
                    />
                ),
            },
            {
                key: 'wheel_diameter',
                label: 'Wheel diameter',
                children: (
                    <ParameterSelectComponent
                        value={
                            controller_wheel_diameter !== NotLoadedYet &&
                            controller_wheel_diameter !== NotAvailable
                                ? controller_wheel_diameter.text
                                : controller_wheel_diameter
                        }
                        options={BafangCanWheelDiameterTable.map(
                            (item) => item.text,
                        )}
                        onNewValue={(value) => {
                            let wheel = BafangCanWheelDiameterTable.find(
                                (wheel) => wheel.text === value,
                            );
                            this.setState({
                                controller_wheel_diameter: wheel
                                    ? wheel
                                    : BafangCanWheelDiameterTable[0],
                            });
                        }}
                    />
                ),
            },
            {
                key: 'circumference',
                label: 'Wheel circumference',
                children: (
                    <ParameterInputComponent
                        value={controller_circumference}
                        unit="mm"
                        min={controller_wheel_diameter.minimalCircumference}
                        max={controller_wheel_diameter.maximalCircumference}
                        onNewValue={(e) => {
                            this.setState({ controller_circumference: e });
                        }}
                    />
                ),
            },
        ];
    }

    getOtherItems(): DescriptionsProps['items'] {
        const {
            controller_serial_number,
            controller_customer_number,
            controller_manufacturer,
        } = this.state;
        return [
            {
                key: 'serial_number',
                label: 'Serial number',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_serial_number}
                        onNewValue={(e) => {
                            this.setState({
                                controller_serial_number: e,
                            });
                        }}
                    />
                ),
            },
            generateSimpleStringListItem(
                'Software version',
                this.state.controller_software_version,
            ),
            generateSimpleStringListItem(
                'Hardware version',
                this.state.controller_hardware_version,
            ),
            generateSimpleStringListItem(
                'Model number',
                this.state.controller_model_number,
            ),
            {
                key: 'manufacturer',
                label: 'Manufacturer',
                children: (
                    <StringInputComponent
                        maxLength={40}
                        value={controller_manufacturer}
                        onNewValue={(e) => {
                            this.setState({
                                controller_manufacturer: e,
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
                        value={controller_customer_number}
                        onNewValue={(e) => {
                            this.setState({
                                controller_customer_number: e,
                            });
                        }}
                    />
                ),
            },
            generateSimpleStringListItem(
                'Bootloader version',
                this.state.controller_bootload_version,
            ),
        ];
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
                    Motor settings
                </Typography.Title>
                <br />
                <Descriptions
                    bordered
                    title="Real-Time data"
                    items={this.getRealtimeItems()}
                    column={1}
                />
                <br />
                <Descriptions
                    bordered
                    title="Speed settings"
                    items={this.getSpeedItems()}
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
                            duration: 10,
                        });
                    }}
                />
                <FloatButton
                    icon={<DeliveredProcedureOutlined />}
                    type="primary"
                    style={{ right: 24 }}
                    onClick={this.saveParameters}
                />
            </div>
        );
    }
}

export default BafangCanMotorSettingsView;
