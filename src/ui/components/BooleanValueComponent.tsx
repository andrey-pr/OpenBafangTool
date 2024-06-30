import { Typography } from 'antd';
import React from 'react';

type BooleanValueProps = {
    value: boolean | number;
    textTrue?: string;
    textFalse?: string;
};

class BooleanValueComponent extends React.Component<BooleanValueProps> {
    static defaultProps = {
        textTrue: 'True',
        textFalse: 'False',
    };

    render() {
        const { value, textTrue, textFalse } = this.props;
        return (
            <>
                {value ? (
                    <Typography.Text strong>{textTrue}</Typography.Text>
                ) : (
                    <Typography.Text strong>{textFalse}</Typography.Text>
                )}
            </>
        );
    }
}

export default BooleanValueComponent;
