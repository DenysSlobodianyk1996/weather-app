import type { App } from 'vue';
import i18n from './i18n'

export function registerPlugins(app: App) {
  app.use(i18n)
}
