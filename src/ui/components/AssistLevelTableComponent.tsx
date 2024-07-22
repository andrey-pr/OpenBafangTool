import { Table } from 'antd';
import React from 'react';
import Column from 'antd/es/table/Column';
import { deepCopy } from 'deep-copy-ts';
import ParameterInputComponent from './ParameterInput';
import { BafangAssistProfile } from '../../types/common';
import i18n from '../../i18n/i18n';

type AssistTableRow = {
    key: React.Key;
    index: number;
    assist_level: number;
    current: number;
    speed: number;
    tip?: string;
    recommended_min?: number;
    recommended_max?: number;
};

type AssistLevelTableProps = {
    assist_profiles: BafangAssistProfile[];
    onChange: (assist_profiles: BafangAssistProfile[]) => void;
    zero_level?: boolean;
};

type AssistLevelTableState = {
    assist_profiles: BafangAssistProfile[];
};

class AssistLevelTableComponent extends React.Component<
    AssistLevelTableProps,
    AssistLevelTableState
> {
    constructor(props: AssistLevelTableProps) {
        super(props);
        this.state = {
            assist_profiles: deepCopy(this.props.assist_profiles),
        };
        this.getAssistLevelTableData = this.getAssistLevelTableData.bind(this);
    }

    getAssistLevelTableData(): AssistTableRow[] {
        const { assist_profiles } = this.state;
        return assist_profiles.map((profile, index) => {
            return {
                tip:
                    index === 0 && this.props.zero_level
                        ? 'Its strongly recommended to set current limit on zero level of assist to 0'
                        : undefined,
                recommended_min: 0,
                recommended_max: index === 0 && this.props.zero_level ? 0 : 100,
                key: index,
                index,
                assist_level: this.props.zero_level ? index : index + 1,
                current: profile.current_limit,
                speed: profile.speed_limit,
            };
        });
    }

    render() {
        return (
            <Table
                dataSource={this.getAssistLevelTableData()}
                pagination={{ position: ['none', 'none'] }}
                style={{ marginBottom: '20px' }}
            >
                <Column
                    title={i18n.t('assist_levels') as string}
                    dataIndex="assist_level"
                    key="assist_level"
                />
                <Column
                    title={i18n.t('current_limit') as string}
                    dataIndex="current"
                    key="current"
                    render={(_: any, record: AssistTableRow) => (
                        <ParameterInputComponent
                            value={record.current}
                            unit="%"
                            min={0}
                            max={100}
                            onNewValue={(e) => {
                                const { assist_profiles } = this.state;
                                assist_profiles[record.index] = {
                                    current_limit: e,
                                    speed_limit:
                                        assist_profiles[record.index]
                                            .speed_limit,
                                };
                                this.setState({
                                    assist_profiles,
                                });
                                this.props.onChange(assist_profiles);
                            }}
                            warningText={record.tip}
                            warningBelow={record.recommended_min}
                            warningAbove={record.recommended_max}
                        />
                    )}
                />
                <Column
                    title={i18n.t('speed_limit') as string}
                    dataIndex="Speed"
                    key="tags"
                    render={(_: any, record: AssistTableRow) => (
                        <ParameterInputComponent
                            value={record.speed}
                            unit="%"
                            min={0}
                            max={100}
                            onNewValue={(e) => {
                                const { assist_profiles } = this.state;
                                assist_profiles[record.index] = {
                                    current_limit:
                                        assist_profiles[record.index]
                                            .current_limit,
                                    speed_limit: e,
                                };
                                this.setState({
                                    assist_profiles,
                                });
                                this.props.onChange(assist_profiles);
                            }}
                        />
                    )}
                />
            </Table>
        );
    }
}

export default AssistLevelTableComponent;
