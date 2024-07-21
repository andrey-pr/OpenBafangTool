import { I18n } from 'i18n-js';
import en from '../../locales/en.json';
import blank from '../../locales/blank.json';

const i18n = new I18n({
    en: { ...en },
    blank: { ...blank },
});

i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export default i18n;
