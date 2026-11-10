import { describe, expect, it } from 'vitest'
import { highlightMatch } from './highlight-match'

describe('highlightMatch', () => {
  it('marks the matching letters, ignoring case', () => {
    expect(highlightMatch('Lvivka, Ukraine', 'lVI')).toEqual([
      { text: 'Lvi', match: true },
      { text: 'vka, Ukraine', match: false },
    ])
  })

  it('marks only the first match', () => {
    expect(highlightMatch('Lviv, Lviv Oblast', 'Lvi')).toEqual([
      { text: 'Lvi', match: true },
      { text: 'v, Lviv Oblast', match: false },
    ])
  })

  it('finds a match in the middle of the text', () => {
    expect(highlightMatch('Bila Tserkva', 'tser')).toEqual([
      { text: 'Bila ', match: false },
      { text: 'Tser', match: true },
      { text: 'kva', match: false },
    ])
  })

  it('handles Ukrainian letters in any case', () => {
    expect(highlightMatch('Київ, Україна', 'КИЇ')).toEqual([
      { text: 'Киї', match: true },
      { text: 'в, Україна', match: false },
    ])
  })

  it('ignores spaces around the query', () => {
    expect(highlightMatch('Odesa', ' ode ')).toEqual([
      { text: 'Ode', match: true },
      { text: 'sa', match: false },
    ])
  })

  it('returns the whole text unmarked when nothing matches', () => {
    expect(highlightMatch('Odesa', 'Lvi')).toEqual([{ text: 'Odesa', match: false }])
    expect(highlightMatch('Odesa', '')).toEqual([{ text: 'Odesa', match: false }])
  })
})
