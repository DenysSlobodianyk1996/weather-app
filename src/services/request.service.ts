import axios from 'axios'

// The APIs the app talks to. Each one gets its key added to every request by the interceptor below.
export const API = {
  openWeather: {
    baseURL: 'https://api.openweathermap.org/data',
    keyParam: 'appid',
    getKey: () => import.meta.env.VITE_OPEN_WEATHER_KEY,
  },
  geoapify: {
    baseURL: 'https://api.geoapify.com/v1',
    keyParam: 'apiKey',
    getKey: () => import.meta.env.VITE_GEOAPIFY_KEY,
  },
} as const;

export type ApiName = keyof typeof API;

export const REQUEST_TIMEOUT_MS = 10_000;

export const httpClient = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
});

httpClient.interceptors.request.use(config => {
  const api = Object.values(API).find(item => item.baseURL === config.baseURL);
  if(api) {
    config.params = { ...config.params, [api.keyParam]: api.getKey() };
  }
  return config;
});

export type RequestErrorKind = 'timeout' | 'network' | 'http' | 'invalid-response';

export interface RequestError {
  kind: RequestErrorKind
  status?: number // HTTP status, only for kind 'http'
  message: string
}

export type RequestResult<T> =
  | { ok: true, data: T }
  | { ok: false, error: RequestError };

export interface RequestOptions<T> {
  api: ApiName
  url: string
  params?: Record<string, unknown>
  // How long a successful result is reused, in ms. Infinity keeps it for the life of the page.
  ttl: number
  // Turns the raw response body into the result data. If it throws, the result is an 'invalid-response' error.
  parse?: (raw: any) => T
}

interface CacheEntry {
  expiresAt: number
  data: unknown
}

const cache = new Map<string, CacheEntry>();
// Requests on their way, so identical requests made at the same time share one HTTP call.
const pending = new Map<string, Promise<RequestResult<unknown>>>();

export function clearRequestCache() {
  cache.clear();
  pending.clear();
}

export function request<T = unknown>(options: RequestOptions<T>): Promise<RequestResult<T>> {
  const { api, url, params } = options;
  const cacheKey = JSON.stringify([api, url, params]);

  const cached = cache.get(cacheKey);
  if(cached && Date.now() < cached.expiresAt) {
    return Promise.resolve({ ok: true, data: cached.data as T });
  }
  cache.delete(cacheKey);

  const inFlight = pending.get(cacheKey);
  if(inFlight) {
    return inFlight as Promise<RequestResult<T>>;
  }
  const result = send(options, cacheKey);
  pending.set(cacheKey, result);
  // send() never rejects, so `finally` is enough; the check keeps a newer entry made after clearRequestCache().
  result.finally(() => {
    if(pending.get(cacheKey) === result) {
      pending.delete(cacheKey);
    }
  });
  return result;
}

async function send<T>(options: RequestOptions<T>, cacheKey: string): Promise<RequestResult<T>> {
  const { api, url, params, ttl, parse = (raw: any) => raw as T } = options;

  let raw: unknown;
  try {
    const response = await httpClient.get(url, { baseURL: API[api].baseURL, params });
    raw = response.data;
  } catch (error) {
    return { ok: false, error: toRequestError(error) };
  }

  let data: T;
  try {
    data = parse(raw);
  } catch (error) {
    return { ok: false, error: { kind: 'invalid-response', message: errorMessage(error) } };
  }

  if(ttl > 0) {
    cache.set(cacheKey, { expiresAt: Date.now() + ttl, data });
  }
  return { ok: true, data };
}

function toRequestError(error: unknown): RequestError {
  const message = errorMessage(error);
  if(!axios.isAxiosError(error)) {
    return { kind: 'network', message };
  }
  if(error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { kind: 'timeout', message };
  }
  if(error.response) {
    return { kind: 'http', status: error.response.status, message };
  }
  return { kind: 'network', message };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
