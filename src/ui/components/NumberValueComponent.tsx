import React, { ReactNode } from 'react';

type NumberValueProps = {
    value: number | null;
    unit?: ReactNode;
};

class NumberValueComponent extends React.Component<NumberValueProps> {
    static defaultProps = {
        unit: undefined,
    };

    render() {
        const { unit, value } = this.props;
        return (
            <>
                {value as number} {unit !== null ? unit : ''}
            </>
        );
    }
}

export default NumberValueComponent;
