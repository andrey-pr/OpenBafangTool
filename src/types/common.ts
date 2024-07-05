export type BafangAssistProfile = {
    current_limit: number;
    speed_limit: number;
};

export const BooleanOptions = [
    {
        value: true,
        label: 'Yes',
    },
    {
        value: false,
        label: 'No',
    },
];

export type PromiseControls = {
    resolve: (...args: any[]) => void;
    reject: (...args: any[]) => void;
};
