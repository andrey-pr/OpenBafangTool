import React from 'react';
import { NoData, NotAvailable, NotLoadedYet } from '../../../types/no_data';

type StringValueProps = {
    value: string | number | NoData;
};

class StringValueComponent extends React.Component<StringValueProps> {
    constructor(props: any) {
        super(props);
    }

    render() {
        const { value } = this.props;
        if (value === NotLoadedYet) {
            return <>Isn't readed yet</>;
        } else if (value === NotAvailable) {
            return <>Not available on this hardware</>;
        } else {
            return <>{value as string}</>;
        }
    }
}

export default StringValueComponent;
