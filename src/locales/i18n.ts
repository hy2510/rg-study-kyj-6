import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationKO from './ko/translation.json'
import translationEN from './en/translation.json'
import translationVI from './vi/translation.json'

const resources = {
  ko: {
    translation: translationKO,
  },
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
}

const REF = (window as any).REF
const lang = REF?.language || 'ko'

i18n.use(initReactI18next).init({
  fallbackLng: 'ko',
  lng: lang,
  resources,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
