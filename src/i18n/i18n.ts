import { I18n } from 'i18n-js';
import en from '../../locales/en.json';
import blank from '../../locales/blank.json';
import { PickerLocale } from 'antd/es/date-picker/generatePicker';

const i18n = new I18n({
    en: { ...en },
    blank: { ...blank },
});

i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export function getTimePickerLocale(): PickerLocale {
    return {
        lang: {
            placeholder: '',
            locale: 'en',
            today: 'Today',
            now: i18n.t('now'),
            backToToday: 'Back to today',
            ok: i18n.t('ok'),
            clear: i18n.t('clear'),
            month: 'Month',
            year: 'Year',
            timeSelect: 'select time',
            dateSelect: 'select date',
            weekSelect: 'Choose a week',
            monthSelect: 'Choose a month',
            yearSelect: 'Choose a year',
            decadeSelect: 'Choose a decade',
            dateFormat: 'M/D/YYYY',
            dateTimeFormat: 'M/D/YYYY HH:mm:ss',
            previousMonth: 'Previous month (PageUp)',
            nextMonth: 'Next month (PageDown)',
            previousYear: 'Last year (Control + left)',
            nextYear: 'Next year (Control + right)',
            previousDecade: 'Last decade',
            nextDecade: 'Next decade',
            previousCentury: 'Last century',
            nextCentury: 'Next century',
        },
        timePickerLocale: { placeholder: '' },
    };
}

export default i18n;
