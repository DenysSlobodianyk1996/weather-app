import { createI18n } from 'vue-i18n'
import en from './en'
import ua from './ua'
import { SELECTED_LANGUAGE_KEY } from '@/static'
import { StorageService } from '@/services'

const messages = {
  en, ua
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
