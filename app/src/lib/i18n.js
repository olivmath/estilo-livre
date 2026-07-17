import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import pt from "@/locales/pt.json"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

export const LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
]

const LOCALE_MAP = { pt: "pt-BR", en: "en-US", es: "es-ES" }
export const getLocale = () => LOCALE_MAP[i18n.language] || "pt-BR"

i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, en: { translation: en }, es: { translation: es } },
  lng: "pt",
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
})

export default i18n
