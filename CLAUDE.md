# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`, then `npm run dev`: Vite dev server on port 4200. App is served under `/weather-app/`, so open http://localhost:4200/weather-app/
- `npm run build`: runs `vue-tsc -b` (type check), then `vite build`, then copies `dist/index.html` to `dist/404.html` (the GitHub Pages SPA fallback)
- `npm run preview`: serve the built `dist/`
- `npm test`: Vitest once (happy-dom). `npm run test:coverage`: the same with a v8 coverage report (no thresholds).

There is no linter. Run `npm test` and `npm run build` (the type check) after changes. CI runs `test:coverage` before the build, so a failing test stops the deploy.

## Environment

Needs a root `.env` with `VITE_OPEN_WEATHER_KEY` (OpenWeatherMap) and `VITE_GEOAPIFY_KEY` (Geoapify). One axios request interceptor in `src/services/request.service.ts` adds these keys to every request; callers never pass them.

## Deployment

Every push to `main` builds and deploys to GitHub Pages (`.github/workflows/deployment-pipeline.yml`). The API keys come from repo secrets `OPEN_WEATHER_KEY` and `GEOAPIFY_KEY`. `base: '/weather-app/'` in `vite.config.ts` must match the Pages path.

## Requirements

The product spec is `public/weather-tech-requirements.pdf`. Check it when you change behavior.

Project docs live in `docs/`: domain terms in `docs/GLOSSARY.md` (use these names in code and tickets), decisions in `docs/adr/`, design mockups in `docs/design/`.

## Agent skills

### Issue tracker

Issues and specs are GitHub Issues on DenysSlobodianyk1996/weather-app, managed with `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `docs/GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Architecture

Vue 3 `<script setup>` + TypeScript, SCSS, vue-i18n, Chart.js, axios. There is no router and no store (no Pinia). `@` is an alias for `src/`. Most folders have an `index.ts` barrel, so import from `@/services`, `@/models`, `@/utils`, `@/static`, `@/composables`.

- `src/services/`: plain object singletons, not classes or composables.
  - `request.service.ts` is the shared request helper: one axios client (10 s timeout, API keys added in one interceptor) and `request({ api, url, params, ttl, parse })`. It caches successful results by api, url and params until `ttl` ms pass (`Infinity` = life of the page), and identical requests made while one is on its way share that one HTTP call. It never rejects: it resolves to `RequestResult<T>`, either `{ ok: true, data }` or `{ ok: false, error }` where `error.kind` is `timeout`, `network`, `http` (with `status`) or `invalid-response` (when `parse` throws). Failures are not cached.
  - `WeatherApiService` calls the OpenWeatherMap 5-day/3-hour forecast in metric units, cached for 10 minutes. It returns `{ list, timezoneOffset }` (seconds from UTC) as the API gives them.
  - `GeoapifyApiService` handles IP geolocation and reverse geocoding (city details), cached for the life of the page, and city autocomplete, cached for 10 minutes.
  - `StorageService` wraps `localStorage`; only the selected language uses it.
- `src/composables/`:
  - `useAsyncData(fetcher)` gives `data`, `loading`, `error`, `load`, `retry` and `reset` over a service that returns a `RequestResult`. It ignores answers to older requests and answers after unmount. City card forecast, city details, city search and the IP lookup use it.
  - `useNow()` is the current time, ticking every minute, so local clocks and "today" move on.
- `src/features/weather/`: the only feature.
  - `city-cards.ts` is the City cards module, with no UI: the City cards, the Favorites, both limits (`MAX_CITY_CARDS`, `MAX_FAVORITES`, 5 each) and the rules between them. Storage is passed in (`browserStorage()` gives `localStorage`, or a storage in memory when the browser blocks it); storage that throws on read starts with no Favorites, and a failed write keeps them in memory. Operations that can hit a limit return `{ ok: false, reason }`; the view shows the modal. A card's `isFavorite` is derived from its Location on every read, never stored. Favorites are saved on every change, as a JSON array of `{lat, lon}`, and same-place duplicates are dropped on load.
  - `use-city-cards.ts` wraps the module with its cards and Favorites as refs. `WeatherFeature.vue` is a thin view over it: tabs, "Add city", limit modals, and the IP lookup that fills the first card.
  - `forecast.ts` is pure: `shapeForecast(list, timezoneOffset, now)` gives local-time Forecast slots, today as Day periods, the 5 local days with Daily averages, and the current conditions. It also holds the date, temperature and compass formatters.
  - `CityCard.vue` fetches the forecast whenever the location or the i18n locale changes; weather text comes back in the current language. `CityWeather.vue` shapes it with `useNow` and shows the Day view or the 5-day view, the loading placeholder, or the error with "Try again". Its header (city name and actions) stays mounted in every state, so the city name loads once.
  - Same place = lat/lon equal to 2 decimals (`isSameLocation` in `src/utils`). Use it for every Location comparison.
- `src/plugins/i18n/`: `en` and `uk` message files. The locale is read from localStorage at startup, and `App.vue` saves it whenever it changes. Add new strings to both files.
- `src/components/base/` holds generic UI (Button, Modal, ConfirmDialog, PillSwitch, Skeleton). `src/components/layout/` holds Header and Main.
- Weather icons are our own inline SVGs (`components/weather-icon/`), picked by the API icon code. Other icons use the Material Icons font through `<span class="material-icons">name</span>`.
- Ids in templates come from `useId()`, never fixed strings, because several cards are on the page at once.

## Tests

Vitest with `@vue/test-utils`, happy-dom and `axios-mock-adapter`. Specs sit next to the file they test as `*.spec.ts`. Shared forecast fixtures are in `src/features/weather/test-support/`. Test through public interfaces and what the user sees: fake the services with `vi.spyOn`, HTTP with `axios-mock-adapter`, and stub `TemperatureChart` in component tests.
