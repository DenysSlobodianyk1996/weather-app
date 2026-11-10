import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import Modal from './Modal.vue'

// A page with a button that opens the modal, the way the app uses it.
const Host = defineComponent({
  setup() {
    const open = ref(false)
    return () => [
      h('button', { id: 'opener', onClick: () => { open.value = true } }, 'Open'),
      h(Modal, { open: open.value, 'onUpdate:open': (value: boolean) => { open.value = value } }, {
        title: () => 'Favorites are full',
        default: () => h('p', 'Remove one first.'),
        actions: () => h('button', { id: 'ok', onClick: () => { open.value = false } }, 'OK'),
      }),
    ]
  },
})

async function openModal() {
  const wrapper = mount(Host, { attachTo: document.body })
  const opener = wrapper.find('#opener')
  ;(opener.element as HTMLButtonElement).focus()
  await opener.trigger('click')
  await flushPromises()
  return wrapper
}

describe('Modal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('stays closed until asked to open', () => {
    const wrapper = mount(Host, { attachTo: document.body })

    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('opens as a modal dialog labelled by its title', async () => {
    const wrapper = await openModal()
    const dialog = wrapper.find('dialog')

    expect(dialog.attributes('open')).toBeDefined()
    expect(dialog.attributes('aria-modal')).toBe('true')
    const title = wrapper.find(`#${dialog.attributes('aria-labelledby')}`)
    expect(title.text()).toBe('Favorites are full')
    expect(dialog.text()).toContain('Remove one first.')
  })

  it('moves focus into the dialog', async () => {
    const wrapper = await openModal()

    expect(document.activeElement).toBe(wrapper.find('#ok').element)
  })

  it('closes on Escape and gives focus back to the opener', async () => {
    const wrapper = await openModal()

    await wrapper.find('dialog').trigger('keydown', { key: 'Escape' })
    await flushPromises()

    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    expect(document.activeElement).toBe(wrapper.find('#opener').element)
  })

  it('closes when the browser cancels the dialog', async () => {
    const wrapper = await openModal()

    await wrapper.find('dialog').trigger('cancel')
    await flushPromises()

    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
  })

  it('closes when its owner closes it', async () => {
    const wrapper = await openModal()

    await wrapper.find('#ok').trigger('click')
    await flushPromises()

    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    expect(document.activeElement).toBe(wrapper.find('#opener').element)
  })
})
