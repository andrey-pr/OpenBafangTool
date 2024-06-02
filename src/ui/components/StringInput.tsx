import { Input, Tooltip } from 'antd';
import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../types/no_data';

type StringInputProps = {
    value: string | NoData;
    maxLength: number;
    onNewValue: (value: string) => void;
    errorOnEmpty?: boolean;
};

type StringInputState = {
    value: string | NoData;
    error: boolean;
};

class StringInputComponent extends React.Component<
    StringInputProps,
    StringInputState
> {
    static defaultProps = {
        errorOnEmpty: false,
    };

    constructor(props: any) {
        super(props);
        const { value } = this.props;
        this.state = { value, error: false };
    }

    static getDerivedStateFromProps(
        props: StringInputProps,
        state: StringInputState,
    ) {
        if (props.value !== state.value) {
            return {
                value: props.value,
            };
        }
        return null;
    }

    render() {
        const { value, error } = this.state;
        const { onNewValue, maxLength, errorOnEmpty } = this.props;
        if (value === NotLoadedYet) {
            return (
                <Input
                    value="Isn't readed yet"
                    style={{ minWidth: '150px' }}
                    disabled
                />
            );
        } else if (value === NotAvailable) {
            return (
                <Input
                    value="Not available on this hardware"
                    style={{ minWidth: '150px' }}
                    disabled
                />
            );
        }
        return (
            <Tooltip
                title="This field should not be empty"
                trigger="click"
                open={error}
            >
                <Input
                    value={value as string}
                    style={{ minWidth: '150px' }}
                    maxLength={maxLength}
                    onChange={(e) => {
                        const tmp = (errorOnEmpty &&
                            e.target.value === '') as boolean;
                        this.setState({
                            value: e.target.value,
                            error: tmp,
                        });
                        onNewValue(e.target.value);
                    }}
                    status={error ? 'error' : ''}
                />
            </Tooltip>
        );
    }
}

export default StringInputComponent;
