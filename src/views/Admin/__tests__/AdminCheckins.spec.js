import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import AdminCheckins from '../AdminCheckins.vue';
import CheckinService from '@/services/CheckinService';
import ProjectsService from '@/services/ProjectsService';
import GamificationService from '@/services/GamificationService';
import AnalyticsService from '@/services/AnalyticsService';
import es from '@/locales/es.json';

vi.mock('@/components/utils/BreadCrumb.vue', () => ({
  default: { name: 'BreadCrumb', template: '<div></div>' },
}));
vi.mock('@/components/LocationPicker.vue', () => ({
  default: { name: 'LocationPicker', template: '<div></div>' },
}));
vi.mock('@/components/analytics/BarChart.vue', () => ({
  default: { name: 'BarChart', template: '<div></div>' },
}));

vi.mock('@/services/CheckinService', () => ({
  default: {
    getForAdmin: vi.fn(),
  },
}));
vi.mock('@/services/ProjectsService', () => ({
  default: {
    getProjectById: vi.fn(),
  },
}));
vi.mock('@/services/GamificationService', () => ({
  default: {
    getGamification: vi.fn(),
  },
}));
vi.mock('@/services/AnalyticsService', () => ({
  default: {
    getCommunityStats: vi.fn(),
  },
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'proj-1' } }),
    useRouter: () => ({ push: vi.fn() }),
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: { es },
});

describe('AdminCheckins.vue - Filters & Metadata', () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();

    ProjectsService.getProjectById.mockResolvedValue({
      _id: 'proj-1',
      name: 'Test Project',
      taskTypes: [
        { name: 'Sacar fotos con celular', description: 'Tomar foto clara' },
        'Observación directa',
      ],
      areas: { type: 'FeatureCollection', features: [] },
    });

    GamificationService.getGamification.mockResolvedValue({
      projectId: 'proj-1',
      badgesRules: [
        { name: 'Explorador Inicial', _id: 'b1' },
        { name: 'Fotógrafo Experto', _id: 'b2' },
      ],
      pointRules: [],
    });

    CheckinService.getForAdmin.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    AnalyticsService.getCommunityStats.mockResolvedValue({
      byArea: [],
      byTaskType: [],
      byInterval: [],
    });

    wrapper = mount(AdminCheckins, {
      global: {
        plugins: [i18n],
        stubs: {
          'v-container': { template: '<div><slot /></div>' },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-text-field': true,
          'v-select': true,
          'v-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'v-chip': { template: '<span><slot /></span>' },
          'v-icon': true,
          'v-alert': { template: '<div><slot /></div>' },
          'v-tabs': { template: '<div><slot /></div>' },
          'v-tab': { template: '<div><slot /></div>' },
          'v-window': { template: '<div><slot /></div>' },
          'v-window-item': { template: '<div><slot /></div>' },
          'v-spacer': true,
          'v-data-table-server': true,
          'v-data-table': true,
          'v-dialog': { template: '<div><slot /></div>' },
          'v-img': true,
          'v-avatar': { template: '<div><slot /></div>' },
          'v-progress-circular': true,
        },
      },
    });

    await flushPromises();
  });

  it('normalizes both object and legacy string taskTypes into string items for the filter select', () => {
    expect(wrapper.vm.taskTypeItems).toEqual([
      'Sacar fotos con celular',
      'Observación directa',
    ]);
  });

  it('loads gamification badges from badgesRules on the gamification payload', () => {
    expect(wrapper.vm.gamificationBadges).toEqual([
      { name: 'Explorador Inicial', _id: 'b1' },
      { name: 'Fotógrafo Experto', _id: 'b2' },
    ]);
  });

  it('sends all active filters together in a single query when applying multiple filters', async () => {
    wrapper.vm.filters.taskName = 'Limpieza';
    wrapper.vm.filters.taskType = 'Sacar fotos con celular';
    wrapper.vm.filters.badgeName = 'Explorador Inicial';
    wrapper.vm.filters.hasPhotos = 'true';
    wrapper.vm.filters.contributed = 'true';
    wrapper.vm.filters.dateFrom = '2026-06-01';
    wrapper.vm.filters.dateTo = '2026-06-01';

    wrapper.vm.applyFilters();
    await flushPromises();

    expect(CheckinService.getForAdmin).toHaveBeenLastCalledWith('proj-1', {
      taskName: 'Limpieza',
      taskType: 'Sacar fotos con celular',
      badgeName: 'Explorador Inicial',
      hasPhotos: 'true',
      contributed: 'true',
      dateFrom: '2026-06-01T00:00:00.000Z',
      dateTo: '2026-06-01T23:59:59.999Z',
      latitude: undefined,
      longitude: undefined,
      radiusKm: undefined,
      page: 1,
      limit: 20,
      sortOrder: 'desc',
    });
  });

  it('clears all filters and reloads when resetFilters is called', async () => {
    wrapper.vm.filters.taskType = 'Sacar fotos con celular';
    wrapper.vm.filters.hasPhotos = 'false';
    wrapper.vm.applyFilters();
    await flushPromises();

    wrapper.vm.resetFilters();
    await flushPromises();

    expect(CheckinService.getForAdmin).toHaveBeenLastCalledWith('proj-1', {
      taskName: undefined,
      taskType: undefined,
      badgeName: undefined,
      hasPhotos: undefined,
      contributed: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      latitude: undefined,
      longitude: undefined,
      radiusKm: undefined,
      page: 1,
      limit: 20,
      sortOrder: 'desc',
    });
  });
});
