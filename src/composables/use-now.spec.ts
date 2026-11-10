import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useNow } from './use-now'

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: Date.parse('2025-11-10T12:00:00Z') })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at the current time and moves on every interval', () => {
    const scope = effectScope()
    const now = scope.run(() => useNow(60_000))!

    expect(now.value).toBe(Date.parse('2025-11-10T12:00:00Z'))
    vi.advanceTimersByTime(60_000)
    expect(now.value).toBe(Date.parse('2025-11-10T12:01:00Z'))

    scope.stop()
  })

  it('stops ticking when its scope ends', () => {
    const scope = effectScope()
    const now = scope.run(() => useNow(60_000))!
    scope.stop()

    vi.advanceTimersByTime(120_000)
    expect(now.value).toBe(Date.parse('2025-11-10T12:00:00Z'))
  })
})
