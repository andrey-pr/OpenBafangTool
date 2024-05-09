import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../../types/no_data';

type StringValueProps = {
    value: string | number | NoData;
};

class StringValueComponent extends React.Component<StringValueProps> {
    render() {
        const { value } = this.props;
        if (value === NotLoadedYet) {
            return <>Isn&apos;t readed yet</>;
        } else if (value === NotAvailable) {
            return <>Not available on this hardware</>;
        }
        return <>{value as string}</>;
    }
}

export default StringValueComponent;
