import it from '../i18n/it.json'
import en from '../i18n/en.json'

export type Lang = 'it' | 'en'

export function getLang(url: URL): Lang {
  const param = url.searchParams.get('lang')
  if (param === 'en') return 'en'
  return 'it'
}

const translations: Record<Lang, Record<string, string>> = { it, en }

export function getTranslation(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations['it'][key] ?? key
}
