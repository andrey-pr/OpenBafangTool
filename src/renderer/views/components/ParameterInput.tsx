import { InputNumber, Tooltip } from 'antd';
import React, { ReactNode } from 'react';

type ParameterInputProps = {
    value: number | null;
    unit?: ReactNode;
    min: number;
    max: number;
    onNewValue: (value: number) => void;
    warningText?: string;
    warningBelow?: number;
    warningAbove?: number;
    checkValue?: (value: number) => boolean;
    disabled?: boolean;
    decimalPlaces?: number;
};

type ParameterInputState = {
    value: number | null;
    warning: boolean;
};

class ParameterInputComponent extends React.Component<
    ParameterInputProps,
    ParameterInputState
> {
    static defaultProps = {
        warningText: '',
        warningBelow: undefined,
        warningAbove: undefined,
        checkValue: undefined,
        disabled: false,
        unit: undefined,
        decimalPlaces: 0,
    };

    constructor(props: any) {
        super(props);
        const { value } = this.props;
        this.state = { value, warning: false };
    }

    static getDerivedStateFromProps(
        props: ParameterInputProps,
        state: ParameterInputState,
    ) {
        if (props.value !== state.value) {
            return {
                value: props.value,
            };
        }
        return null;
    }

    render() {
        const { value, warning } = this.state;
        const {
            unit,
            min,
            max,
            onNewValue,
            warningText,
            warningBelow,
            warningAbove,
            checkValue,
            disabled,
            decimalPlaces,
        } = this.props;
        return (
            <Tooltip title={warningText} trigger="click" open={warning}>
                <InputNumber
                    min={min}
                    max={max}
                    value={value}
                    addonAfter={unit}
                    style={{ minWidth: '150px' }}
                    onChange={(e) => {
                        if (e != null) {
                            let tmp = false;
                            tmp ||=
                                warningBelow !== undefined && e < warningBelow;
                            tmp ||=
                                warningAbove !== undefined && e > warningAbove;
                            tmp ||= checkValue !== undefined && !checkValue(e);
                            this.setState({
                                value:
                                    Math.floor(
                                        e * 10 ** (decimalPlaces as number),
                                    ) /
                                    (e * 10 ** (decimalPlaces as number)),
                                warning: tmp,
                            });
                            onNewValue(e);
                        }
                    }}
                    status={warning ? 'warning' : ''}
                    disabled={disabled}
                />
            </Tooltip>
        );
    }
}

export default ParameterInputComponent;
