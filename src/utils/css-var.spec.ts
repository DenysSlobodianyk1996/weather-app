import { afterEach, describe, expect, it } from 'vitest'
import { cssVar } from './css-var'

describe('cssVar', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--color-test')
  })

  it('reads a custom property from the root element, trimmed', () => {
    document.documentElement.style.setProperty('--color-test', ' #3d6c9e ')

    expect(cssVar('--color-test')).toBe('#3d6c9e')
  })

  it('returns an empty string for an unknown property', () => {
    expect(cssVar('--color-missing')).toBe('')
  })
})
