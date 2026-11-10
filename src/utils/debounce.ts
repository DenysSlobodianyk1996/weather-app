export interface Debounced<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void
  /** Drops the call that is waiting, if any. */
  cancel(): void
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
): Debounced<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = undefined
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = undefined
  }

  return debounced
}
