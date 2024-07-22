import { Typography } from 'antd';
import React from 'react';
import i18n from '../../i18n/i18n';

type BooleanValueProps = {
    value: boolean | number;
    textTrue?: string;
    textFalse?: string;
};

class BooleanValueComponent extends React.Component<BooleanValueProps> {
    static defaultProps = {
        textTrue: i18n.t('true'),
        textFalse: i18n.t('false'),
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
