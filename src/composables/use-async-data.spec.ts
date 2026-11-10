import { describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { RequestError, RequestResult } from '@/services'
import { useAsyncData } from './use-async-data'

// A request whose answer the test hands over when it chooses.
function deferred<T>() {
  let resolve!: (result: RequestResult<T>) => void
  const promise = new Promise<RequestResult<T>>(res => { resolve = res })
  return { promise, resolve }
}

const timeout: RequestError = { kind: 'timeout', message: 'timeout of 10000ms exceeded' }

describe('useAsyncData', () => {
  it('starts idle, with no data and no error', () => {
    const { data, loading, error } = useAsyncData(vi.fn())

    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('is loading while the request runs, then holds its data', async () => {
    const request = deferred<string>()
    const { data, loading, error, load } = useAsyncData((_city: string) => request.promise)

    const done = load('Kyiv')
    expect(loading.value).toBe(true)

    request.resolve({ ok: true, data: 'sunny' })
    await done

    expect(loading.value).toBe(false)
    expect(data.value).toBe('sunny')
    expect(error.value).toBeNull()
  })

  it('passes its arguments to the request', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, data: 1 })
    const { load } = useAsyncData(fetcher)

    await load({ lat: 1, lon: 2 }, 'uk')

    expect(fetcher).toHaveBeenCalledWith({ lat: 1, lon: 2 }, 'uk')
  })

  it('holds the error and no data when the request fails', async () => {
    const { data, loading, error, load } = useAsyncData(() => Promise.resolve<RequestResult<string>>({ ok: false, error: timeout }))

    await load()

    expect(loading.value).toBe(false)
    expect(error.value).toEqual(timeout)
    expect(data.value).toBeNull()
  })

  it('treats a rejected request as a network error', async () => {
    const { error, load } = useAsyncData(() => Promise.reject(new Error('boom')))

    await load()

    expect(error.value).toEqual({ kind: 'network', message: 'boom' })
  })

  it('ignores a late answer once a newer request has started', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetcher = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { data, loading, load } = useAsyncData(fetcher)

    const firstDone = load('Lviv')
    const secondDone = load('Kharkiv')

    second.resolve({ ok: true, data: 'Kharkiv forecast' })
    await secondDone
    first.resolve({ ok: true, data: 'Lviv forecast' })
    await firstDone

    expect(data.value).toBe('Kharkiv forecast')
    expect(loading.value).toBe(false)
  })

  it('stays loading when an older request answers before the newer one', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const fetcher = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    const { data, loading, error, load } = useAsyncData(fetcher)

    load('Lviv')
    const secondDone = load('Kharkiv')
    first.resolve({ ok: false, error: timeout })
    await Promise.resolve()

    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()

    second.resolve({ ok: true, data: 'Kharkiv forecast' })
    await secondDone
    expect(data.value).toBe('Kharkiv forecast')
  })

  it('retries the last request with the same arguments and clears the error', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: timeout })
      .mockResolvedValueOnce({ ok: true, data: 'sunny' })
    const { data, error, loading, load, retry } = useAsyncData(fetcher)

    await load('Kyiv', 'en')
    expect(error.value).toEqual(timeout)

    const retried = retry()
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
    await retried

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenLastCalledWith('Kyiv', 'en')
    expect(data.value).toBe('sunny')
    expect(error.value).toBeNull()
  })

  it('does nothing on retry before anything was loaded', async () => {
    const fetcher = vi.fn()
    const { loading, retry } = useAsyncData(fetcher)

    await retry()

    expect(fetcher).not.toHaveBeenCalled()
    expect(loading.value).toBe(false)
  })

  it('clears everything on reset and ignores the request still running', async () => {
    const request = deferred<string>()
    const { data, loading, error, load, reset } = useAsyncData(() => request.promise)

    const done = load()
    reset()
    expect(loading.value).toBe(false)

    request.resolve({ ok: true, data: 'sunny' })
    await done

    expect(data.value).toBeNull()
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('ignores an answer that arrives after its owner is gone', async () => {
    const request = deferred<string>()
    const scope = effectScope()
    const state = scope.run(() => useAsyncData(() => request.promise))!

    const done = state.load()
    scope.stop()
    request.resolve({ ok: true, data: 'sunny' })
    await done

    expect(state.data.value).toBeNull()
  })
})
