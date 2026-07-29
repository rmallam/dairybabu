import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import teTranslation from './locales/te.json';
import hiTranslation from './locales/hi.json';
import mrTranslation from './locales/mr.json';
import knTranslation from './locales/kn.json';
import taTranslation from './locales/ta.json';

const resources = {
  en: { translation: enTranslation },
  te: { translation: teTranslation },
  hi: { translation: hiTranslation },
  mr: { translation: mrTranslation },
  kn: { translation: knTranslation },
  ta: { translation: taTranslation },
};

const savedLanguage = localStorage.getItem('dairy_app_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
