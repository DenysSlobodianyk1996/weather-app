import { getCurrentScope, onScopeDispose, ref, shallowRef, type Ref } from 'vue';
import type { RequestError, RequestResult } from '@/services';

export interface AsyncData<T, A extends unknown[]> {
  /** The last successful answer. Null before the first answer and after a failure or reset. */
  data: Ref<T | null>
  /** True while the newest request is running. */
  loading: Ref<boolean>
  /** Why the newest request failed, or null. */
  error: Ref<RequestError | null>
  /** Starts a request. An answer to an older request that arrives after this one started is ignored. */
  load: (...args: A) => Promise<void>
  /** Runs the last request again with the same arguments. Does nothing if nothing was loaded yet. */
  retry: () => Promise<void>
  /** Clears data, error and loading, and ignores the request still running. */
  reset: () => void
}

/**
 * Loading state for one piece of data a component shows, fetched with a service that returns a RequestResult.
 * Used inside a component, answers that arrive after the component is gone are ignored too.
 */
export function useAsyncData<T, A extends unknown[] = []>(
  fetcher: (...args: A) => Promise<RequestResult<T>>,
): AsyncData<T, A> {
  const data = shallowRef<T | null>(null);
  const loading = ref(false);
  const error = shallowRef<RequestError | null>(null);

  // Each request gets the next number; only the answer to the newest one is kept.
  let latestRequest = 0;
  let lastArgs: A | null = null;

  async function load(...args: A) {
    const requestNumber = ++latestRequest;
    lastArgs = args;
    loading.value = true;
    error.value = null;

    let result: RequestResult<T>;
    try {
      result = await fetcher(...args);
    } catch (thrown) {
      // Services never reject, but a broken one must not leave the component loading forever.
      result = { ok: false, error: { kind: 'network', message: thrown instanceof Error ? thrown.message : String(thrown) } };
    }

    if(requestNumber !== latestRequest) {
      return;
    }
    loading.value = false;
    if(result.ok) {
      data.value = result.data;
    } else {
      data.value = null;
      error.value = result.error;
    }
  }

  function retry() {
    return lastArgs ? load(...lastArgs) : Promise.resolve();
  }

  function reset() {
    latestRequest++;
    data.value = null;
    error.value = null;
    loading.value = false;
  }

  if(getCurrentScope()) {
    onScopeDispose(() => {
      latestRequest++;
    });
  }

  return { data, loading, error, load, retry, reset };
}
