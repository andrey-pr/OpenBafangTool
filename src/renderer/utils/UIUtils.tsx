import { ReactNode } from 'react';
import { Typography } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import StringValueComponent from '../views/components/StringValueComponent';
import { NoData } from '../../types/no_data';
import NumberValueComponent from '../views/components/NumberValueComponent';
import BooleanValueComponent from '../views/components/BooleanValueComponent';
import StringInputComponent from '../views/components/StringInput';
import ParameterInputComponent from '../views/components/ParameterInput';
import SelectParameterComponent from '../views/components/SelectParameterComponent';

const { Text } = Typography;

export function generateSimpleStringListItem(
    text: string,
    content: string | number | NoData,
    note?: string,
): DescriptionsItemType {
    return {
        label: (
            <>
                {text}
                {note && (
                    <>
                        <br /> <Text italic>{note}</Text>
                    </>
                )}
            </>
        ),
        children: <StringValueComponent value={content} />,
        contentStyle: { width: '50%' },
    };
}

export function generateEditableStringListItem(
    text: string,
    content: string | NoData,
    onNewValue: (value: string) => void,
    maxLength = 40,
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <StringInputComponent
                maxLength={maxLength}
                value={content}
                onNewValue={onNewValue}
            />
        ),
        contentStyle: { width: '50%' },
    };
}

export function generateSimpleNumberListItem(
    text: string,
    content: number | NoData,
    content_unit?: ReactNode,
): DescriptionsItemType {
    return {
        label: text,
        children: <NumberValueComponent value={content} unit={content_unit} />,
        contentStyle: { width: '50%' },
    };
}

export function generateEditableNumberListItem(
    text: string,
    content: number | NoData,
    onNewValue: (e: number) => void,
    content_unit?: ReactNode,
    min?: number,
    max?: number,
    decimalPlaces?: number,
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <ParameterInputComponent
                value={content}
                unit={content_unit}
                min={min}
                max={max}
                decimalPlaces={decimalPlaces}
                onNewValue={onNewValue}
            />
        ),
        contentStyle: { width: '50%' },
    };
}

export function generateEditableNumberListItemWithWarning(
    text: string,
    content: number | NoData,
    warningText: string,
    warningBelow: number,
    warningAbove: number,
    onNewValue: (e: number) => void,
    content_unit?: ReactNode,
    min?: number,
    max?: number,
    decimalPlaces?: number,
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <ParameterInputComponent
                value={content}
                unit={content_unit}
                min={min}
                max={max}
                decimalPlaces={decimalPlaces}
                onNewValue={onNewValue}
                warningText={warningText}
                warningBelow={warningBelow}
                warningAbove={warningAbove}
            />
        ),
        contentStyle: { width: '50%' },
    };
}

export function generateSimpleBooleanListItem(
    text: string,
    content: boolean | number | NoData,
    text_true?: string,
    text_false?: string,
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <BooleanValueComponent
                value={content}
                textTrue={text_true}
                textFalse={text_false}
            />
        ),
        contentStyle: { width: '50%' },
    };
}

export function generateEditableSelectListItem(
    text: string,
    options: { value: string | number; label: string }[],
    value: string | number | NoData,
    onChange: (e: string | number) => void,
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <SelectParameterComponent
                value={value}
                options={options}
                onChange={onChange}
            />
        ),
        contentStyle: { width: '50%' },
    };
}
