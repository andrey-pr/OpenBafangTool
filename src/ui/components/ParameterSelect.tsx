import { Select } from 'antd';
import React from 'react';

const { Option } = Select;

type ParameterSelectProps = {
    value: string | null;
    options: string[];
    onNewValue: (value: string) => void;
};

type ParameterSelectState = {
    value: string | null;
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
        return (
            <Select
                onChange={(new_value) => {
                    if (new_value !== null) {
                        this.setState({
                            value: new_value,
                        });
                        onNewValue(new_value as string);
                    }
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
