import React from 'react';
import i18n from '../../i18n/i18n';

type StringValueProps = {
    value: string | number | null;
};

class StringValueComponent extends React.Component<StringValueProps> {
    render() {
        const { value } = this.props;
        if (value === null) return i18n.t('not_available');
        return value;
    }
}

export default StringValueComponent;
