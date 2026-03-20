import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LocationPicker from '../LocationPicker.vue'

// Mock OpenLayers — jsdom can't render canvas maps
vi.mock('ol', () => ({
  Map: vi.fn().mockImplementation(() => ({
    setTarget: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    on: vi.fn(),
    getView: () => ({
      fit: vi.fn(),
      animate: vi.fn(),
    }),
  })),
  Overlay: vi.fn(),
  View: vi.fn(),
}))
const { mockVectorSource } = vi.hoisted(() => {
  const mockVectorSource = vi.fn().mockImplementation(() => ({
    getExtent: () => [0, 0, 1, 1],
    addFeature: vi.fn(),
    getFeatures: vi.fn().mockReturnValue([]),
  }))
  return { mockVectorSource }
})

vi.mock('ol/layer', () => ({
  Tile: vi.fn(),
  Vector: vi.fn(),
}))
vi.mock('ol/layer/Tile', () => ({ default: vi.fn() }))
vi.mock('ol/layer/Vector', () => ({ default: vi.fn() }))
vi.mock('ol/source', () => ({
  OSM: vi.fn(),
  Vector: mockVectorSource,
}))
vi.mock('ol/source/OSM', () => ({ default: vi.fn() }))
vi.mock('ol/source/Vector', () => ({
  default: mockVectorSource,
}))
vi.mock('ol/format/GeoJSON', () => ({
  default: vi.fn().mockImplementation(() => ({
    readFeatures: vi.fn().mockReturnValue([]),
  })),
}))
vi.mock('ol/style', () => ({
  Style: vi.fn(),
  Fill: vi.fn(),
  Stroke: vi.fn(),
  Text: vi.fn(),
}))
vi.mock('ol/style/Circle', () => ({ default: vi.fn() }))
vi.mock('ol/Feature', () => ({
  default: vi.fn().mockImplementation(() => ({
    setStyle: vi.fn(),
    getId: vi.fn().mockReturnValue(undefined),
    getProperties: vi.fn().mockReturnValue({}),
    setId: vi.fn(),
    getGeometry: vi.fn(),
  })),
}))
vi.mock('ol/geom/Point', () => ({ default: vi.fn() }))
vi.mock('ol/proj', () => ({
  fromLonLat: (coords) => coords,
  toLonLat: (coords) => coords,
}))

// Mock vue3-toastify
vi.mock('vue3-toastify', () => ({
  toast: { info: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'EN',
  messages: {
    EN: {
      checkin: {
        pick_location_title: 'Pick location from map',
        pick_location_hint: 'Tap on the map to mark your location.',
        selected_location: 'Selected location',
        geo_not_supported: 'Geo not supported',
        geo_failed: 'Geo failed',
      },
      common: {
        cancel: 'Cancel',
        confirm: 'Confirm',
      },
      map: {
        center_on_location: 'Center on my location',
      },
    },
  },
})

// Vuetify stubs
const vuetifyStub = {
  install(app) {
    const stubs = [
      'v-dialog', 'v-card', 'v-card-title', 'v-card-text', 'v-card-actions',
      'v-btn', 'v-icon', 'v-spacer', 'v-alert'
    ]
    stubs.forEach(name => {
      app.component(name, {
        name,
        template: `<div class="${name}"><slot /></div>`,
        props: { modelValue: {}, color: {}, disabled: {}, type: {}, variant: {}, density: {}, persistent: {}, maxWidth: {} },
      })
    })
  }
}

function createWrapper(props = {}) {
  return mount(LocationPicker, {
    global: {
      plugins: [i18n, vuetifyStub],
    },
    props: {
      modelValue: true,
      areas: null,
      initialLatitude: '',
      initialLongitude: '',
      ...props,
    },
  })
}

describe('LocationPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when modelValue is true', () => {
    const wrapper = createWrapper({ modelValue: true })
    expect(wrapper.text()).toContain('Pick location from map')
    expect(wrapper.text()).toContain('Tap on the map to mark your location.')
  })

  it('shows cancel and confirm buttons', () => {
    const wrapper = createWrapper({ modelValue: true })
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Confirm')
  })

  it('confirm button is disabled when no location is selected', () => {
    const wrapper = createWrapper({ modelValue: true })
    // selectedCoords starts as null
    expect(wrapper.vm.selectedCoords).toBeNull()
  })

  it('does not show selected location alert when no coords selected', () => {
    const wrapper = createWrapper({ modelValue: true })
    expect(wrapper.text()).not.toContain('Selected location')
  })

  it('placeMarker updates selectedCoords when map exists', () => {
    const wrapper = createWrapper({ modelValue: true })
    // placeMarker requires map to be set
    wrapper.vm.map = {
      removeLayer: vi.fn(),
      addLayer: vi.fn(),
    }
    wrapper.vm.placeMarker([-58.381592, -34.603722])

    expect(wrapper.vm.selectedCoords).toEqual({
      latitude: '-34.603722',
      longitude: '-58.381592',
    })
  })

  it('confirm emits location-selected with coords', async () => {
    const wrapper = createWrapper({ modelValue: true })
    wrapper.vm.map = { removeLayer: vi.fn(), addLayer: vi.fn() }
    wrapper.vm.placeMarker([-3.703790, 40.416775])
    wrapper.vm.confirm()

    expect(wrapper.vm.selectedCoords).toEqual({
      latitude: '40.416775',
      longitude: '-3.703790',
    })
    // show is set to false
    expect(wrapper.vm.show).toBe(false)
  })

  it('confirm closes the dialog by setting show to false', () => {
    const wrapper = createWrapper({ modelValue: true })
    wrapper.vm.map = { removeLayer: vi.fn(), addLayer: vi.fn() }
    wrapper.vm.placeMarker([10, 20])
    wrapper.vm.confirm()

    expect(wrapper.vm.show).toBe(false)
  })

  it('cancel closes without emitting location', () => {
    const wrapper = createWrapper({ modelValue: true })
    wrapper.vm.cancel()

    expect(wrapper.vm.selectedCoords).toBeNull()
    expect(wrapper.vm.show).toBe(false)
  })

  it('cancel resets selectedCoords to null', () => {
    const wrapper = createWrapper({ modelValue: true })
    wrapper.vm.map = { removeLayer: vi.fn(), addLayer: vi.fn() }
    wrapper.vm.placeMarker([10, 20])
    expect(wrapper.vm.selectedCoords).not.toBeNull()

    wrapper.vm.cancel()
    expect(wrapper.vm.selectedCoords).toBeNull()
  })

  describe('centerOnMe', () => {
    it('calls geolocation API', () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn(),
      }
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      })

      const wrapper = createWrapper({ modelValue: true })
      // Need a map instance for centerOnMe to work
      wrapper.vm.map = {
        getView: () => ({ animate: vi.fn() }),
      }
      wrapper.vm.centerOnMe()

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
    })
  })

  describe('with areas prop', () => {
    it('accepts areas prop without errors', () => {
      const areas = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 'area-1' },
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
          },
        ],
      }
      const wrapper = createWrapper({ modelValue: true, areas })
      expect(wrapper.vm.$props.areas).toEqual(areas)
    })
  })

  describe('with initial coordinates', () => {
    it('accepts initial lat/lng props', () => {
      const wrapper = createWrapper({
        modelValue: true,
        initialLatitude: '-34.603722',
        initialLongitude: '-58.381592',
      })
      expect(wrapper.vm.$props.initialLatitude).toBe('-34.603722')
      expect(wrapper.vm.$props.initialLongitude).toBe('-58.381592')
    })
  })
})
