import { Select } from 'antd';
import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../../types/no_data';

const { Option } = Select;

type ParameterSelectProps = {
    value: string | NoData | null;
    options: string[];
    onNewValue: (value: string) => void;
};

type ParameterSelectState = {
    value: string | NoData | null;
};

class ParameterSelectComponent extends React.Component<
    ParameterSelectProps,
    ParameterSelectState
> {
    constructor(props: any) {
        super(props);
        const { value } = this.props;
        this.state = { value };
    }

    static getDerivedStateFromProps(
        props: ParameterSelectProps,
        state: ParameterSelectState,
    ) {
        if (props.value !== state.value) {
            return {
                value: props.value,
            };
        }
        return null;
    }

    render() {
        const { value } = this.state;
        const { onNewValue, options } = this.props;
        if (value === NotLoadedYet) {
            return (
                <Select
                    allowClear
                    style={{ minWidth: '150px' }}
                    value="error"
                    disabled
                >
                    <Option value="error" key="error">
                        Isn&apos;t readed yet
                    </Option>
                </Select>
            );
        } else if (value === NotAvailable) {
            return (
                <Select
                    allowClear
                    style={{ minWidth: '150px' }}
                    value="error"
                    disabled
                >
                    <Option value="error" key="error">
                        Not available on this hardware
                    </Option>
                </Select>
            );
        }
        return (
            <Select
                onChange={(new_value) => {
                    this.setState({
                        value: new_value,
                    });
                    onNewValue(new_value as string);
                }}
                allowClear
                style={{ minWidth: '150px' }}
                value={value}
            >
                {options.map((item: string) => {
                    return (
                        <Option value={item} key={item}>
                            {item}
                        </Option>
                    );
                })}
            </Select>
        );
    }
}

export default ParameterSelectComponent;
