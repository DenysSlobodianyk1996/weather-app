import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import Header from './Header.vue'

function mountHeader() {
  return mount(Header, { global: { plugins: [i18n] } })
}

describe('Header', () => {
  afterEach(() => {
    i18n.global.locale.value = 'en'
  })

  it('shows the logo and the app title', () => {
    const wrapper = mountHeader()

    expect(wrapper.find('svg.header__logo').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Weather')
  })

  it('places the brand before the language switch, in normal flow', () => {
    const wrapper = mountHeader()
    const children = wrapper.find('.header__inner').element.children

    expect(children[0].classList.contains('header__brand')).toBe(true)
    expect(children[children.length - 1].tagName).toBe('BUTTON')
  })

  it('labels the language switch and shows the current language', () => {
    const wrapper = mountHeader()
    const button = wrapper.find('button')

    expect(button.attributes('aria-label')).toBe('Change language (EN)')
    expect(button.text()).toContain('EN')
  })

  it('switches to the next language on click', async () => {
    const wrapper = mountHeader()

    await wrapper.find('button').trigger('click')

    expect(i18n.global.locale.value).toBe('uk')
    expect(wrapper.find('h1').text()).toBe('Погода')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Змінити мову (UK)')
  })

  it('wraps back to the first language after the last one', async () => {
    const wrapper = mountHeader()

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(i18n.global.locale.value).toBe('en')
  })
})
