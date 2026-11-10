import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WeatherIcon from './WeatherIcon.vue'
import { WEATHER_ICON_CODES } from './weather-icons'

const render = (code: string, description = 'light rain', size?: number) =>
  mount(WeatherIcon, { props: { code, description, size } })

describe('WeatherIcon', () => {
  it('uses the weather description as its accessible name', () => {
    const svg = render('10d', 'light rain').get('svg')

    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('light rain')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
  })

  it('is hidden from screen readers when there is no description', () => {
    const svg = render('10d', '').get('svg')

    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('role')).toBeUndefined()
    expect(svg.attributes('aria-label')).toBeUndefined()
  })

  it.each(WEATHER_ICON_CODES)('draws %s inline, without loading an image', (code) => {
    const wrapper = render(code)

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.html()).not.toContain('openweathermap')
    expect(wrapper.findAll('svg path, svg circle').length).toBeGreaterThan(0)
  })

  it('draws an unknown code like 03d', () => {
    expect(render('99x').html()).toBe(render('03d').html())
  })

  it('draws different artwork for day and night where the codes differ', () => {
    expect(render('10d').html()).not.toBe(render('10n').html())
    expect(render('04d').html()).toBe(render('04n').html())
  })

  it('is 64 px by default and takes another size', () => {
    expect(render('01d').get('svg').attributes('width')).toBe('64')

    const small = render('01d', 'clear sky', 28).get('svg')
    expect(small.attributes('width')).toBe('28')
    expect(small.attributes('height')).toBe('28')
    expect(small.attributes('viewBox')).toBe('0 0 64 64')
  })

  it('thickens strokes at small sizes so outlines stay visible', () => {
    const strokeWidth = (size: number) =>
      parseFloat(render('10d', 'rain', size).get('path[style*="stroke-width"]').attributes('style')!.match(/stroke-width:\s*([\d.]+)/)![1])

    expect(strokeWidth(64)).toBe(2.5)
    expect(strokeWidth(32)).toBe(3)
    expect(strokeWidth(28)).toBe(3.5)
  })

  it('colours the artwork with theme tokens', () => {
    const html = render('11d').html()

    expect(html).toContain('var(--color-sun)')
    expect(html).not.toMatch(/#[0-9a-f]{6}/i)
  })
})
