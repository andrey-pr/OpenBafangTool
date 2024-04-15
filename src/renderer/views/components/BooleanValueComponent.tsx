import { Typography } from 'antd';
import React, { ReactNode } from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../types/no_data';

type BooleanValueProps = {
    value: boolean | NoData;
    textTrue?: string;
    textFalse?: string;
};

class BooleanValueComponent extends React.Component<BooleanValueProps> {
    static defaultProps = {
        textTrue: 'True',
        textFalse: 'False',
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        const { value, textTrue, textFalse } = this.props;
        if (value === NotLoadedYet) {
            return <>Isn't readed yet</>;
        } else if (value === NotAvailable) {
            return <>Not available on this hardware</>;
        } else {
            return (
                <>
                    {value ? (
                        <Typography.Text strong>
                            {textTrue}
                        </Typography.Text>
                    ) : (
                        <Typography.Text strong>
                            {textFalse}
                        </Typography.Text>
                    )}
                </>
            );
        }
    }
}

export default BooleanValueComponent;
