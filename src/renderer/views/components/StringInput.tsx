import { Input, Tooltip } from 'antd';
import React from 'react';

type StringInputProps = {
    value: string;
    maxLength: number;
    onNewValue: (value: string) => void;
    errorOnEmpty?: boolean;
};

type StringInputState = {
    value: string;
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
        return (
            <Tooltip
                title="This field should not be empty"
                trigger="click"
                open={error}
            >
                <Input
                    value={value}
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
