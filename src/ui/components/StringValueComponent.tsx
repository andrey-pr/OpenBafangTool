import React from 'react';

type StringValueProps = {
    value: string | number | null;
};

class StringValueComponent extends React.Component<StringValueProps> {
    render() {
        const { value } = this.props;
        if (value === null) return <>Not available</>;
        return <>{value}</>;
    }
}

export default StringValueComponent;
