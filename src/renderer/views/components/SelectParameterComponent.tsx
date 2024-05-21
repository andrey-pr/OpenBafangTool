import { Select } from 'antd';
import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../../types/no_data';

type SelectParameterProps = {
    value: string | number | NoData;
    options: { value: string | number; label: string }[];
    onChange: (e: string | number) => void;
};

type SelectParameterState = {
    value: string | number | NoData;
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
                        this.props.onChange(e as string | number);
                    }
                }}
            />
        );
    }
}

export default SelectParameterComponent;
