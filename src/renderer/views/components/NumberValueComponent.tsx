import React, { ReactNode } from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../../types/no_data';

type NumberValueProps = {
    value: number | NoData;
    unit?: ReactNode;
};

class NumberValueComponent extends React.Component<NumberValueProps> {
    static defaultProps = {
        unit: undefined,
    };

    render() {
        const { unit, value } = this.props;
        if (value === NotLoadedYet) {
            return <>Isn&apos;t readed yet</>;
        } else if (value === NotAvailable) {
            return <>Not available on this hardware</>;
        }
        return (
            <>
                {value as number} {unit !== undefined ? unit : ''}
            </>
        );
    }
}

export default NumberValueComponent;
