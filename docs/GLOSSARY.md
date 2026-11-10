# Weather

A weather app that shows forecasts for several cities side by side and lets the user keep a short list of favourite places.

## Places

**Location**:
A point on the map given by latitude and longitude. Two Locations are the same place when their coordinates match to 2 decimal places.
_Avoid_: City, coordinates, place

**City card**:
A slot on the Main tab that shows the forecast for one Location, or is still empty waiting for the user to pick one.
_Avoid_: Block, card, widget

**Favorite**:
A Location the user has saved. A Favorite is not a City card; a City card is marked as favorite when its Location is a Favorite.
_Avoid_: Favorite card, saved city

## Forecast

**Forecast slot**:
One 3-hour step of the forecast, with its time given in the Location's local time.
_Avoid_: Hour, item, list entry

**Day period**:
One quarter of a local day: night (00–06), morning (06–12), day (12–18) or evening (18–24). Each holds the Forecast slots that start within it.
_Avoid_: Time of day, column

**Day view**:
The view of a City card that shows today, in the Location's local time, slot by slot.
_Avoid_: Day mode

**5-day view**:
The view of a City card that shows today and the next 4 days, one Daily average each.
_Avoid_: Week view, week mode

**Daily average**:
The mean temperature of a local day's Forecast slots that are still in the forecast.
_Avoid_: Day temperature, mean
