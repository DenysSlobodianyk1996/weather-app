import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/plugins/i18n'
import TemperatureChart from './TemperatureChart.vue'

// Records what each chart is given, instead of drawing on a canvas.
const charts = vi.hoisted(() => [] as any[])

vi.mock('chart.js/auto', async () => {
  const { vi } = await import('vitest')
  return {
    default: vi.fn(function (this: any, _context: unknown, config: any) {
      this.config = config
      this.data = config.data
      this.destroy = vi.fn()
      this.update = vi.fn()
      charts.push(this)
    }),
  }
})

function mountChart(props: { viewMode: 'day' | 'week', labels: string[], temperatures: number[] }) {
  return mount(TemperatureChart, { props, global: { plugins: [i18n] }, attachTo: document.body })
}

describe('TemperatureChart', () => {
  beforeEach(() => {
    charts.length = 0
    // happy-dom has no canvas drawing; any context object will do for the fake chart.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('draws the Day view as a filled line over local times', () => {
    const wrapper = mountChart({ viewMode: 'day', labels: ['14:00', '17:00', '20:00'], temperatures: [0, 3, -1] })

    expect(charts).toHaveLength(1)
    const { config } = charts[0]
    expect(config.type).toBe('line')
    expect(config.data.labels).toEqual(['14:00', '17:00', '20:00'])
    expect(config.data.datasets).toHaveLength(1)
    expect(config.data.datasets[0]).toMatchObject({ data: [0, 3, -1], fill: true })
    expect(wrapper.find('figcaption').text()).toBe('Temperature today, °C')
  })

  it('draws bars in Week mode', () => {
    mountChart({ viewMode: 'week', labels: ['11-10 14:00'], temperatures: [5] })

    expect(charts[0].config.type).toBe('bar')
  })

  it('updates the chart when the data changes', async () => {
    const wrapper = mountChart({ viewMode: 'day', labels: ['14:00'], temperatures: [1] })
    await wrapper.setProps({ labels: ['17:00', '20:00'], temperatures: [2, 3] })

    expect(charts).toHaveLength(1)
    expect(charts[0].update).toHaveBeenCalled()
    expect(charts[0].data.labels).toEqual(['17:00', '20:00'])
    expect(charts[0].data.datasets[0].data).toEqual([2, 3])
  })

  it('does not redraw when given the same points again', async () => {
    const wrapper = mountChart({ viewMode: 'day', labels: ['14:00'], temperatures: [1] })
    await wrapper.setProps({ labels: ['14:00'], temperatures: [1] })

    expect(charts[0].update).not.toHaveBeenCalled()
  })

  it('destroys the chart when the card goes away', () => {
    const wrapper = mountChart({ viewMode: 'day', labels: ['14:00'], temperatures: [1] })
    wrapper.unmount()

    expect(charts[0].destroy).toHaveBeenCalledTimes(1)
  })
})
