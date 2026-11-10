import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders the slot content inside a button', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Save')
  })

  it('passes attributes through to the button', () => {
    const wrapper = mount(Button, {
      attrs: { disabled: true, class: 'active', 'aria-label': 'Add city' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('active')
    expect(wrapper.attributes('aria-label')).toBe('Add city')
  })

  it('emits native clicks to listeners', async () => {
    let clicks = 0
    const wrapper = mount(Button, { attrs: { onClick: () => clicks++ } })

    await wrapper.trigger('click')

    expect(clicks).toBe(1)
  })
})
