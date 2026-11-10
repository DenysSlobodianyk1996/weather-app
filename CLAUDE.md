# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`, then `npm run dev`: Vite dev server on port 4200. App is served under `/weather-app/`, so open http://localhost:4200/weather-app/
- `npm run build`: runs `vue-tsc -b` (type check), then `vite build`, then copies `dist/index.html` to `dist/404.html` (the GitHub Pages SPA fallback)
- `npm run preview`: serve the built `dist/`

There is no test runner and no linter. `npm run build` is the only check: run it after changes to catch type errors.

## Environment

Needs a root `.env` with `VITE_OPEN_WEATHER_KEY` (OpenWeatherMap) and `VITE_GEOAPIFY_KEY` (Geoapify). Axios request interceptors add these keys to every request; callers never pass them.

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

Vue 3 `<script setup>` + TypeScript, SCSS, vue-i18n, Chart.js, axios. There is no router and no store (no Pinia). `@` is an alias for `src/`. Most folders have an `index.ts` barrel, so import from `@/services`, `@/models`, `@/utils`, `@/static`.

- `src/services/`: plain object singletons, not classes or composables.
  - `WeatherApiService` calls the OpenWeatherMap 5-day/3-hour forecast in metric units. It adds `dt_txt_day` and `dt_txt_time` to each item.
  - `GeoapifyApiService` handles IP geolocation, reverse geocoding (city details) and city autocomplete.
  - Both cache responses in module-level `Map`s keyed by `JSON.stringify(params)`. They catch errors and return a fallback (`[]`, `null` or `undefined`), so callers never see a rejection.
  - `StorageService` wraps `localStorage` and JSON-encodes objects. Call `getItem(key, true)` to parse.
- `src/features/weather/`: the only feature.
  - `WeatherFeature.vue` owns all state: `cityCards` (Main tab) and `favoriteCityCards` (Favorite tab). Children are presentational. They emit `add`, `update` and `remove` with a full `CityCardModel`, and `WeatherFeature.updateCityCard` works out whether the location or the favorite flag changed.
  - On mount, saved favorite locations load from localStorage. The first Main card uses the IP location and reuses the favorite card object if the location matches. A watcher writes favorites back to storage.
  - Limits: `MAX_CITY_CARDS_AMOUNT` (5) in `src/static/city-cards.ts`. The favorites limit of 5 is hard-coded in `updateCityCard`.
  - `CityCard.vue` fetches the forecast whenever the location or the i18n locale changes. Weather text comes back in the current language.
- `src/plugins/i18n/`: `en` and `uk` message files. The locale is read from localStorage at startup, and `App.vue` saves it whenever it changes. Add new strings to both files.
- `src/components/base/` holds generic UI (Button, ConfirmDialog, Skeleton). `src/components/layout/` holds Header and Main.
- Icons use the Material Icons font through `<span class="material-icons">name</span>`.
