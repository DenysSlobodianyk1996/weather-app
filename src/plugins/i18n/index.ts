import { createI18n } from 'vue-i18n'
import en from './en'
import uk from './uk'
import { SELECTED_LANGUAGE_KEY } from '@/static'
import { StorageService } from '@/services'

const messages = {
  en, uk
}

function getStorageLanguage(): string {
  const lang = StorageService.getItem(SELECTED_LANGUAGE_KEY);
  return lang ?? 'en'
}

export default createI18n({
  locale: getStorageLanguage(),
  fallbackLocale: 'en',
  messages
})
