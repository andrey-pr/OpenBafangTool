import i18n from '../i18n/i18n';

export type BafangAssistProfile = {
    current_limit: number;
    speed_limit: number;
};

export const BooleanOptions = [
    {
        value: true,
        label: i18n.t('yes'),
    },
    {
        value: false,
        label: i18n.t('no'),
    },
];

export type PromiseControls = {
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
};
