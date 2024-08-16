import { ReactNode } from 'react';
import { Typography } from 'antd';
import { DescriptionsItemType } from 'antd/es/descriptions';
import StringValueComponent from '../components/StringValueComponent';
import NumberValueComponent from '../components/NumberValueComponent';
import BooleanValueComponent from '../components/BooleanValueComponent';
import StringInputComponent from '../components/StringInput';
import ParameterInputComponent from '../components/ParameterInput';
import SelectParameterComponent from '../components/SelectParameterComponent';

const { Text } = Typography;

export function generateSimpleStringListItem(
    text: string,
    content: string | number | null,
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
    content: string | null,
    onNewValue: (value: string) => void,
    maxLength = 40,
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
    content: number | null,
    content_unit?: ReactNode,
): DescriptionsItemType {
    return {
        label: text,
        children: <NumberValueComponent value={content} unit={content_unit} />,
        contentStyle: { width: '50%' },
    };
}

export function generateSimpleNumberMulticolumnListItem(
    text: string,
    content: number,
    content_unit?: ReactNode,
): DescriptionsItemType {
    return {
        label: text,
        children: <NumberValueComponent value={content} unit={content_unit} />,
    };
}

export function generateEditableNumberListItem(
    text: string,
    content: number | null,
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

export function generateAnnotatedEditableNumberListItem(
    text: string,
    content: number | null,
    onNewValue: (e: number) => void,
    note: string,
    content_unit?: ReactNode,
    min?: number,
    max?: number,
    decimalPlaces?: number,
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

export function generateAnnotatedEditableNumberListItemWithWarning(
    text: string,
    content: number | null,
    warningText: string,
    warningBelow: number,
    warningAbove: number,
    onNewValue: (e: number) => void,
    note: string,
    content_unit?: ReactNode,
    min?: number,
    max?: number,
    decimalPlaces?: number,
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

export function generateEditableNumberListItemWithWarning(
    text: string,
    content: number,
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
    content: boolean | number,
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
    options: { value: string | number | boolean; label: string }[],
    value: string | number | boolean | null,
    onChange: (e: string | number | boolean) => void,
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
