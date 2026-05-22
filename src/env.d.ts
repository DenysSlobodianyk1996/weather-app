declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMeta {
  readonly env: {
    BASE_URL: string;
    VITE_OPEN_WEATHER_KEY: string;
    VITE_GEOAPIFY_KEY: string;
  }
}
