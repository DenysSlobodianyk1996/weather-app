import { describe, expect, it } from 'vitest'
import { isSameLocation, uniqueLocations } from './same-location'

describe('isSameLocation', () => {
  it('treats Locations that match to 2 decimal places as the same place', () => {
    expect(isSameLocation({ lat: 50.4501, lon: 30.5234 }, { lat: 50.45, lon: 30.52 })).toBe(true)
    expect(isSameLocation({ lat: 50.449, lon: 30.521 }, { lat: 50.451, lon: 30.519 })).toBe(true)
  })

  it('treats Locations that differ at 2 decimal places as different places', () => {
    expect(isSameLocation({ lat: 50.45, lon: 30.52 }, { lat: 50.46, lon: 30.52 })).toBe(false)
    expect(isSameLocation({ lat: 50.45, lon: 30.52 }, { lat: 50.45, lon: 30.53 })).toBe(false)
  })

  it('treats a missing Location as no place', () => {
    expect(isSameLocation(undefined, { lat: 0, lon: 0 })).toBe(false)
    expect(isSameLocation(undefined, undefined)).toBe(false)
  })

  it('treats both sides of zero that round to 0 as the same place', () => {
    expect(isSameLocation({ lat: -0.001, lon: 0.001 }, { lat: 0, lon: 0 })).toBe(true)
  })
})

describe('uniqueLocations', () => {
  it('keeps the first of each place, in order', () => {
    const kyiv = { lat: 50.45, lon: 30.52 }
    const lviv = { lat: 49.84, lon: 24.03 }

    expect(uniqueLocations([kyiv, lviv, { lat: 50.4501, lon: 30.5199 }])).toEqual([kyiv, lviv])
  })
})
