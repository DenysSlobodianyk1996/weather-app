import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the function once with the last arguments after the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    debounced('b')
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('b')
  })

  it('restarts the delay on every call', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(80)
    debounced()
    vi.advanceTimersByTime(80)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(20)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('drops the waiting call on cancel', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('a')
    debounced.cancel()
    vi.advanceTimersByTime(100)
    expect(fn).not.toHaveBeenCalled()

    debounced('b')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('b')
  })
})
