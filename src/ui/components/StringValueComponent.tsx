import React from 'react';

type StringValueProps = {
    value: string | number | null;
};

class StringValueComponent extends React.Component<StringValueProps> {
    render() {
        const { value } = this.props;
        if (value) return <>{value}</>;
        else return <>Not available</>;
    }
}

export default StringValueComponent;
