declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMeta {
  readonly env: {
    VITE_OPEN_WEATHER_KEY: string;
    VITE_GEOAPIFY_KEY: string;
  }
}
