import { Select } from 'antd';
import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../types/no_data';

type SelectParameterProps = {
    value: string | number | boolean | NoData;
    options: { value: string | number | boolean; label: string }[];
    onChange: (e: string | number | boolean) => void;
};

type SelectParameterState = {
    value: string | number | boolean | NoData;
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
        if (value === NotLoadedYet) {
            return <>Isn&apos;t readed yet</>;
        } else if (value === NotAvailable) {
            return <>Not available on this hardware</>;
        }
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
