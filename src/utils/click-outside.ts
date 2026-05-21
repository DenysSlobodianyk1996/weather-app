import { onMounted, onBeforeUnmount, type ShallowRef } from 'vue'

export function useClickOutside(
  box: Readonly<ShallowRef<HTMLDivElement | null>>,
  callback: Function
) {
  const handler = (event: any) => {
    if (box.value && !box.value.contains(event.target)) {
      callback()
    }
  }

  onMounted(() => document.addEventListener('click', handler))
  onBeforeUnmount(() => document.removeEventListener('click', handler))
}