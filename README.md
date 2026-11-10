# Weather

A weather app built with Vue 3, TypeScript and Vite. It shows the forecast for up to 5 cities side by side, starting with your own city (found by IP), and keeps up to 5 favourite cities in the browser. Each city card shows the current conditions, today in the city's local time (table and temperature chart) or a 5-day view with daily average temperatures. The interface and the weather descriptions are in English or Ukrainian.

Forecasts come from [OpenWeatherMap](https://openweathermap.org/) (5-day / 3-hour forecast). IP location, city search and city names come from [Geoapify](https://www.geoapify.com/). Charts use [Chart.js](https://www.chartjs.org/) directly, with no Vue wrapper. There is no CSS framework or UI library.

## Links

- Hosted: https://denysslobodianyk1996.github.io/weather-app/
- Requirements: `public/weather-tech-requirements.pdf`, also at https://denysslobodianyk1996.github.io/weather-app/weather-tech-requirements.pdf
- Design: redesign mockups (Claude Design canvas) at https://claude.ai/artifact/CbZYdaqu1gqyYJfW6b2mGQ. The source files are in `docs/design/project/`.
- Domain terms: `docs/GLOSSARY.md`

## Run locally

1. Create `.env` in the project root with your API keys:

   ```
   VITE_OPEN_WEATHER_KEY=<OpenWeatherMap API key>
   VITE_GEOAPIFY_KEY=<Geoapify API key>
   ```

   The keys are added to every request in `src/services/request.service.ts`.
2. `npm install`
3. `npm run dev`, then open http://localhost:4200/weather-app/

Other scripts:

- `npm test`: run the unit and component tests once (Vitest, happy-dom)
- `npm run test:coverage`: the same, with a coverage report
- `npm run build`: type check (`vue-tsc`), then build to `dist/`
- `npm run preview`: serve the built `dist/`

The tests never call the real APIs, so they don't need the keys.

## Deployment

Every push to `main` runs the tests with coverage, builds, and deploys to GitHub Pages (`.github/workflows/deployment-pipeline.yml`). A failing test stops the deploy. The coverage report appears in the job summary. The API keys come from the repository secrets `OPEN_WEATHER_KEY` and `GEOAPIFY_KEY`.

## Requirements status

Requirements 1 to 12 from the PDF are done.

Requirement 13, the Day/Night switch, is **not done**. There is no dark theme or theme toggle.

## Extra features (requirement 14)

City cards and Favorites

- A "N of 5 cities" counter next to "Add city", and a "N of 5 favorites" counter on the Favorites tab.
- The same city is never saved twice. Two picks count as the same place when their coordinates match to 2 decimal places, whether they come from the IP lookup, search or "Use my location". Changing the city on a card never removes a Favorite.
- A city card's heart is filled wherever its city is a Favorite, on either tab. Removing a Favorite on the Favorites tab empties the heart on the Main tab.
- Favorites saved by the old version of the app still load, and old duplicates are merged.
- The "Favorites are full" modal names the city you tried to add and has an "Open Favorites" button.
- The delete confirmation names the city and says it stays in your Favorites.
- The last city card has no delete button, so the Main tab is never empty.
- A "Use my location" button on each card, and a "Pick a city" prompt on an empty card.
- The Favorites tab explains how to save a city when it is empty.

Forecast

- Every date and time is in the city's own local time, not UTC or the browser's time.
- Each card shows the current conditions: temperature, icon, description, feels like, and the local date and time, which keep ticking.
- The Day view splits today into night, morning, day and evening. It shows temperature, feels like, humidity, wind (direction and speed), pressure and visibility for every 3-hour slot.
- The 5-day view shows the low and high next to each day's average, with an icon and description for the day.
- Forecasts refresh after 10 minutes. City names and search results are cached while the page is open.
- When a forecast fails to load, the card says so and offers "Try again". City search tells you when the search failed.
- A slow answer for a city you've already changed never overwrites the newer one.
- Switching the language reloads the weather descriptions in that language. Dates are formatted for the language.

City search

- The matching letters in each result are bold.
- Arrow keys move through the results, Enter picks one and Escape closes the list.

Look and accessibility

- A redesign to the approved mockups: the Slate palette, our own SVG weather icons, and a layout that works from 360 px to 1200 px. The day table scrolls sideways with its row labels pinned.
- Visible focus rings, labels on all icon-only buttons, keyboard tabs, modals that trap focus and close on Escape, and text contrast of at least 4.5:1.

For developers

- Unit and component tests (Vitest), run in CI before every deploy.
- The City card and Favorite rules are in one module with no UI (`src/features/weather/city-cards.ts`). Forecast shaping is in one pure module (`src/features/weather/forecast.ts`).
- One request layer with an expiring cache and typed errors (`src/services/request.service.ts`), and one data-loading helper that ignores late answers (`src/composables/use-async-data.ts`).
