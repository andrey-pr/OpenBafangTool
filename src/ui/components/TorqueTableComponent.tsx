import { Table } from 'antd';
import React from 'react';
import Column from 'antd/es/table/Column';
import { deepCopy } from 'deep-copy-ts';
import ParameterInputComponent from './ParameterInput';
import { BafangCanTorqueProfile } from '../../types/BafangCanSystemTypes';

type TorqueTableRow = {
    key: React.Key;
    start_torque_value: number;
    max_torque_value: number;
    return_torque_value: number;
    min_current: number;
    max_current: number;
    start_pulse: number;
    current_decay_time: number;
    stop_delay: number;
    index: number;
    level: number;
};

type TorqueTableProps = {
    torque_profiles: BafangCanTorqueProfile[];
    onChange: (gear_level: BafangCanTorqueProfile[]) => void;
};

type TorqueTableState = {
    torque_profiles: BafangCanTorqueProfile[];
};

class TorqueTableComponent extends React.Component<
    TorqueTableProps,
    TorqueTableState
> {
    constructor(props: TorqueTableProps) {
        super(props);
        this.state = {
            torque_profiles: deepCopy(this.props.torque_profiles),
        };
        this.getTorqueTableData = this.getTorqueTableData.bind(this);
    }

    getTorqueTableData(): TorqueTableRow[] {
        const { torque_profiles } = this.state;
        return torque_profiles.map((profile, index) => {
            return {
                key: index,
                index,
                level: index,
                start_torque_value: profile.start_torque_value,
                max_torque_value: profile.max_torque_value,
                return_torque_value: profile.return_torque_value,
                min_current: profile.min_current,
                max_current: profile.max_current,
                start_pulse: profile.start_pulse,
                current_decay_time: profile.current_decay_time,
                stop_delay: profile.stop_delay,
            };
        });
    }

    render() {
        return (
            <Table
                dataSource={this.getTorqueTableData()}
                pagination={{ position: ['none', 'none'] }}
                style={{ marginBottom: '20px' }}
                scroll={{ x: true }}
            >
                <Column title="Assist level" dataIndex="level" key="level" />
                <Column
                    title="Start torque value"
                    dataIndex="start_torque_value"
                    key="start_torque_value"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.start_torque_value}
                            min={0}
                            max={255}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[
                                    record.index
                                ].start_torque_value = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Max torque value"
                    dataIndex="max_torque_value"
                    key="max_torque_value"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.max_torque_value}
                            min={0}
                            max={255}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[record.index].max_torque_value =
                                    e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Return torque value"
                    dataIndex="return_torque_value"
                    key="return_torque_value"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.return_torque_value}
                            min={0}
                            max={255}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[
                                    record.index
                                ].return_torque_value = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Minimum current"
                    dataIndex="min_current"
                    key="min_current"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.min_current}
                            unit="%"
                            min={0}
                            max={100}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[record.index].min_current = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Maximum current"
                    dataIndex="max_current"
                    key="max_current"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.max_current}
                            unit="%"
                            min={0}
                            max={100}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[record.index].max_current = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Start pulse"
                    dataIndex="start_pulse"
                    key="start_pulse"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.start_pulse}
                            min={1}
                            max={24}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[record.index].start_pulse = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Current decay time"
                    dataIndex="current_decay_time"
                    key="current_decay_time"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.current_decay_time}
                            unit="ms"
                            min={1}
                            max={1275}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[
                                    record.index
                                ].current_decay_time = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
                <Column
                    title="Stop delay"
                    dataIndex="stop_delay"
                    key="stop_delay"
                    render={(_: any, record: TorqueTableRow) => (
                        <ParameterInputComponent
                            value={record.stop_delay}
                            unit="ms"
                            min={1}
                            max={510}
                            onNewValue={(e) => {
                                const { torque_profiles } = this.state;
                                torque_profiles[record.index].stop_delay = e;
                                this.setState({
                                    torque_profiles,
                                });
                                this.props.onChange(torque_profiles);
                            }}
                        />
                    )}
                />
            </Table>
        );
    }
}

export default TorqueTableComponent;
