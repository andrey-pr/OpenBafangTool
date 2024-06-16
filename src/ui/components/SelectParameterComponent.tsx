import { Select } from 'antd';
import React from 'react';

type SelectParameterProps = {
    value: string | number | boolean;
    options: { value: string | number | boolean; label: string }[];
    onChange: (e: string | number | boolean) => void;
};

type SelectParameterState = {
    value: string | number | boolean;
};

class SelectParameterComponent extends React.Component<
    SelectParameterProps,
    SelectParameterState
> {
    static defaultProps = {};

    constructor(props: SelectParameterProps) {
        super(props);
        this.state = {
            value: props.value,
        };
    }

    render() {
        const { value, options } = this.props;
        return (
            <Select
                value={value}
                style={{ width: '100%' }}
                options={options}
                onChange={(e) => {
                    if (e !== null) {
                        this.setState({ value: e });
                        this.props.onChange(e as string | number | boolean);
                    }
                }}
            />
        );
    }
}

export default SelectParameterComponent;
