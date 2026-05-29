import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RegisterCheckin from '../RegisterCheckin.vue'

// Mock LocationPicker component
vi.mock('../LocationPicker.vue', () => ({
  default: {
    name: 'LocationPicker',
    template: '<div class="location-picker-stub"></div>',
    props: ['modelValue', 'areas', 'initialLatitude', 'initialLongitude'],
    emits: ['update:modelValue', 'location-selected'],
  }
}))

// Mock GamificationService
vi.mock('@/services/GamificationService', () => ({
  default: {
    registerCheckin: vi.fn().mockResolvedValue({ id: '123', contributesTo: null }),
    rate: vi.fn().mockResolvedValue({}),
  }
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { projectId: 'project-1' } }),
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock vue3-toastify
vi.mock('vue3-toastify', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'EN',
  messages: {
    EN: {
      checkin: {
        button_register: 'Register Check-in',
        title_register: 'Register Check-in',
        location: 'Location',
        latitude: 'Latitude',
        longitude: 'Longitude',
        use_current_location: 'Use my location',
        pick_from_map: 'Pick from map',
        date_time: 'Date and Time',
        timestamp: 'Timestamp',
        task_type_label: 'Task type',
        searching_location: 'Searching...',
        geo_not_supported: 'Geo not supported',
        geo_failed: 'Geo failed',
        registered_success: 'Registered!',
        register_error: 'Error',
        new_badge: 'New badge!',
        points_added: '+{points}pts',
        contributed_to: 'Contributed to {name}',
        no_contribution: 'No contribution',
        how_did_you_feel: 'How did you feel?',
        rating_boring: 'Boring',
        rating_fun: 'Fun',
      },
      common: {
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...',
        accept: 'Accept',
        complete_all_fields: 'Please complete all fields.',
      },
    },
  },
})

// Minimal vuetify stubs
const vuetifyStub = {
  install(app) {
    const stubs = [
      'v-btn', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text',
      'v-card-actions', 'v-form', 'v-row', 'v-col', 'v-text-field',
      'v-select', 'v-icon', 'v-spacer', 'v-progress-circular', 'v-alert',
      'v-rating'
    ]
    stubs.forEach(name => {
      app.component(name, {
        name,
        template: `<div class="${name}"><slot /></div>`,
        props: { modelValue: {}, loading: {}, disabled: {}, items: {}, label: {}, color: {}, type: {}, variant: {}, block: {}, size: {}, text: {} },
      })
    })
    app.component('v-tooltip', {
      name: 'v-tooltip',
      template: `<div class="v-tooltip"><slot name="activator" :props="{}"/><slot /></div>`,
      props: { text: {}, location: {} },
    })
  }
}

function createWrapper(props = {}) {
  return mount(RegisterCheckin, {
    global: {
      plugins: [i18n, vuetifyStub],
    },
    props: {
      taskTypes: ['Observation', 'Survey'],
      manualLocationEnabled: true,
      areas: null,
      ...props,
    },
  })
}

describe('RegisterCheckin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the register button', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Register Check-in')
  })

  it('opens the modal when the register button is clicked', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('.v-btn')
    await buttons[0].trigger('click')
    expect(wrapper.vm.showModal).toBe(true)
  })

  it('has empty lat/lng fields when modal opens', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('.v-btn')
    await buttons[0].trigger('click')
    expect(wrapper.vm.form.latitude).toBe('')
    expect(wrapper.vm.form.longitude).toBe('')
  })

  it('shows "Use my location" and "Pick from map" buttons', () => {
    const wrapper = createWrapper()
    const text = wrapper.text()
    expect(text).toContain('Use my location')
    expect(text).toContain('Pick from map')
  })

  describe('setCurrentLocation', () => {
    it('sets coordinates from geolocation API', () => {
      const mockPosition = {
        coords: { latitude: -34.603722, longitude: -58.381592 }
      }
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => success(mockPosition)),
      }
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      })

      const wrapper = createWrapper()
      wrapper.vm.setCurrentLocation()

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
      expect(wrapper.vm.form.latitude).toBe('-34.603722')
      expect(wrapper.vm.form.longitude).toBe('-58.381592')
      expect(wrapper.vm.loadingLocation).toBe(false)
    })

    it('shows toast on geolocation failure', async () => {
      const { toast } = await import('vue3-toastify')
      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => error(new Error('denied'))),
      }
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true,
      })

      const wrapper = createWrapper()
      wrapper.vm.setCurrentLocation()

      expect(toast.info).toHaveBeenCalledWith('Geo failed')
      expect(wrapper.vm.loadingLocation).toBe(false)
    })
  })

  describe('onMapLocationSelected', () => {
    it('fills in coordinates from map picker', () => {
      const wrapper = createWrapper()
      wrapper.vm.onMapLocationSelected({
        latitude: '40.416775',
        longitude: '-3.703790',
      })

      expect(wrapper.vm.form.latitude).toBe('40.416775')
      expect(wrapper.vm.form.longitude).toBe('-3.703790')
    })
  })

  describe('openMapPicker', () => {
    it('sets showMapPicker to true', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.showMapPicker).toBe(false)
      wrapper.vm.openMapPicker()
      expect(wrapper.vm.showMapPicker).toBe(true)
    })
  })

  describe('form validation', () => {
    it('shows toast when submitting without required fields', async () => {
      const { toast } = await import('vue3-toastify')
      const wrapper = createWrapper()
      wrapper.vm.submitForm()
      expect(toast.info).toHaveBeenCalledWith('Please complete all fields.')
    })

    it('submits successfully when all fields are filled', async () => {
      const GamificationService = (await import('@/services/GamificationService')).default
      const wrapper = createWrapper()

      wrapper.vm.form.latitude = '-34.603722'
      wrapper.vm.form.longitude = '-58.381592'
      wrapper.vm.form.taskType = 'Observation'
      wrapper.vm.form.datetime = '2026-03-14T12:00'

      wrapper.vm.submitForm()

      expect(GamificationService.registerCheckin).toHaveBeenCalledOnce()
      const payload = GamificationService.registerCheckin.mock.calls[0][0]
      expect(payload).toBeInstanceOf(FormData)
      expect(payload.get('latitude')).toBe('-34.603722')
      expect(payload.get('longitude')).toBe('-58.381592')
      expect(payload.get('taskType')).toBe('Observation')
      expect(payload.get('datetime')).toBe('2026-03-14T12:00')
      expect(payload.get('projectId')).toBe('project-1')
    })
  })

  describe('resetForm', () => {
    it('clears all form fields', () => {
      const wrapper = createWrapper()
      wrapper.vm.form.latitude = '10'
      wrapper.vm.form.longitude = '20'
      wrapper.vm.form.taskType = 'Survey'

      wrapper.vm.resetForm()

      expect(wrapper.vm.form.latitude).toBe('')
      expect(wrapper.vm.form.longitude).toBe('')
      expect(wrapper.vm.form.taskType).toBe('')
    })
  })
})
