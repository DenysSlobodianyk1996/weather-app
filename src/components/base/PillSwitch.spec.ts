import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PillSwitch from './PillSwitch.vue'

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
]

describe('PillSwitch', () => {
  it('shows a labelled group with one button per option', () => {
    const wrapper = mount(PillSwitch, { props: { modelValue: 'day', options, label: 'Forecast view' } })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Forecast view')
    expect(wrapper.findAll('button').map(button => button.text())).toEqual(['Day', 'Week'])
  })

  it('marks the current option as pressed', () => {
    const wrapper = mount(PillSwitch, { props: { modelValue: 'week', options, label: 'Forecast view' } })
    const [day, week] = wrapper.findAll('button')

    expect(day.attributes('aria-pressed')).toBe('false')
    expect(week.attributes('aria-pressed')).toBe('true')
  })

  it('emits the option that was clicked', async () => {
    const wrapper = mount(PillSwitch, { props: { modelValue: 'day', options, label: 'Forecast view' } })

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['week']])
  })
})
