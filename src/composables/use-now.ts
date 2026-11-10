import { onScopeDispose, readonly, ref, type Ref } from 'vue'

/**
 * The current time in ms, updated every `intervalMs`, so local clocks and "today" move on while a card stays open.
 * The timer stops when the calling component or effect scope ends.
 */
export function useNow(intervalMs = 60_000): Readonly<Ref<number>> {
  const now = ref(Date.now())
  const timer = setInterval(() => {
    now.value = Date.now()
  }, intervalMs)
  onScopeDispose(() => clearInterval(timer))
  return readonly(now)
}
