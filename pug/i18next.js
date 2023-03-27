import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../src/language/en.json' assert { type: 'json' };
import fr from '../src/language/fr.json' assert { type: 'json' };

// Supported languages
const langs = ['en', 'fr'];
const translations = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

i18next.use(LanguageDetector).init({
  fallbackLng: 'en',
  supportedLngs: langs,
  detection: {
    order: ['querystring', 'navigator', 'htmlTag', 'path'],
    lookupQuerystring: 'lng',
    lookupFromPathIndex: 0,
  },
  resources: translations,
});

export { langs, i18next, translations };
