import { DescriptionsItemType } from 'antd/es/descriptions';
import StringValueComponent from '../views/components/StringValueComponent';
import { NoData } from '../../types/no_data';
import NumberValueComponent from '../views/components/NumberValueComponent';
import { ReactNode } from 'react';
import BooleanValueComponent from '../views/components/BooleanValueComponent';
import StringInputComponent from '../views/components/StringInput';
import ParameterInputComponent from '../views/components/ParameterInput';

export function generateSimpleStringListItem(
    text: string,
    content: string | number | NoData,
): DescriptionsItemType {
    return {
        label: text,
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
): DescriptionsItemType {
    return {
        label: text,
        children: (
            <ParameterInputComponent
                value={content}
                unit={content_unit}
                min={min}
                max={max}
                onNewValue={onNewValue}
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