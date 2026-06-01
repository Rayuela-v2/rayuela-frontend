<template>
  <v-container>
    <BreadCrumb items="checkinsPath"/>
    <h1 class="mb-4">{{ $t('admin.checkins_title') }}</h1>

    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="logs">{{ $t('admin.checkin_records') || 'Registro de Check-ins' }}</v-tab>
      <v-tab value="stats">{{ $t('admin.statistics_title') || 'Estadísticas' }}</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="logs">
        <v-card class="pa-4 mb-4">
      <h3 class="mb-3">{{ $t('admin.filters_title') }}</h3>
      <v-row dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.taskName"
            :label="$t('admin.filter_task_name')"
            :placeholder="$t('admin.filter_task_name_placeholder')"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.taskType"
            :items="taskTypeItems"
            :label="$t('admin.filter_task_type')"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.hasPhotos"
            :items="hasPhotosItems"
            :label="$t('admin.filter_has_photos')"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.contributed"
            :items="contributedItems"
            :label="$t('admin.filter_contributed')"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row dense class="mt-2">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.dateFrom"
            :label="$t('admin.filter_date_from')"
            type="date"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="filters.dateTo"
            :label="$t('admin.filter_date_to')"
            type="date"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="filters.badgeName"
            :items="gamificationBadges"
            item-title="name"
            item-value="name"
            :label="$t('admin.filter_badge_name') || 'Medalla desbloqueada'"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <!-- Location filter: instead of typing lat/lng by hand, the admin
           picks a center on the map. Radius sits right next to the
           picker so the two read as a single "within X km of Y" unit. -->
      <div class="location-filter mt-4">
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-map-marker-radius-outline</v-icon>
          <strong>{{ $t('admin.filter_location_title') }}</strong>
        </div>

        <!-- No center yet → single CTA button + hint. -->
        <div v-if="!locationCenter">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-map-marker-plus"
            @click="locationPickerOpen = true"
          >
            {{ $t('admin.filter_location_pick') }}
          </v-btn>
          <div class="text-caption text-disabled mt-1">
            {{ $t('admin.filter_location_pick_hint') }}
          </div>
        </div>

        <!-- Center selected → coord chip, radius input, and edit/clear
             actions all aligned in a single row so they look connected. -->
        <div v-else class="d-flex align-center ga-2 flex-wrap">
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-map-marker">
            {{ locationCenter.latitude }}, {{ locationCenter.longitude }}
          </v-chip>
          <span class="text-body-2">{{ $t('admin.filter_location_within') }}</span>
          <v-text-field
            v-model="filters.radiusKm"
            type="number"
            min="0.001"
            :placeholder="$t('admin.filter_radius_km_placeholder')"
            :suffix="$t('admin.filter_radius_km_suffix')"
            hide-details
            density="compact"
            variant="outlined"
            style="max-width: 140px"
          />
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-map-marker-plus"
            @click="locationPickerOpen = true"
          >
            {{ $t('admin.filter_location_change') }}
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            color="error"
            prepend-icon="mdi-close"
            @click="clearLocation"
          >
            {{ $t('admin.filter_location_clear') }}
          </v-btn>
        </div>

        <v-alert
          v-if="locationFilterError"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-2"
        >
          {{ locationFilterError }}
        </v-alert>
      </div>

      <LocationPicker
        v-model="locationPickerOpen"
        :areas="projectAreas"
        :initial-latitude="filters.latitude"
        :initial-longitude="filters.longitude"
        @location-selected="onLocationPicked"
      />

      <v-row dense class="mt-2">
        <v-col cols="12" class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="resetFilters">{{ $t('admin.filter_reset') }}</v-btn>
          <v-btn
            color="primary"
            :disabled="Boolean(locationFilterError)"
            @click="applyFilters"
          >
            {{ $t('admin.filter_apply') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ $t('admin.checkin_records') }}</span>
        <v-chip class="ml-3" size="small" variant="tonal" color="primary">
          {{ $t('admin.checkin_total', { total }) }}
        </v-chip>
        <v-spacer />
        <v-select
          v-model="sortOrder"
          :items="sortItems"
          :label="$t('common.order')"
          density="compact"
          hide-details
          variant="outlined"
          style="max-width: 200px"
          @update:model-value="reload"
        />
      </v-card-title>

      <v-data-table-server
        v-model:items-per-page="limit"
        v-model:page="page"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="loading"
        :items-per-page-options="[10, 20, 50, 100]"
        :no-data-text="$t('admin.no_checkins')"
      >
        <template v-slot:[`item.datetime`]="{ item }">
          {{ formatDate(item.datetime) }}
        </template>

        <template v-slot:[`item.taskName`]="{ item }">
          {{ item.taskName || $t('admin.no_task_link') }}
        </template>

        <template v-slot:[`item.taskType`]="{ item }">
          {{ item.taskType || '-' }}
        </template>

        <template v-slot:[`item.location`]="{ item }">
          <span class="text-caption">
            {{ Number(item.latitude).toFixed(5) }}, {{ Number(item.longitude).toFixed(5) }}
          </span>
        </template>

        <template v-slot:[`item.imageRefs`]="{ item }">
          <v-btn
            v-if="(item.imageRefs || []).length > 0"
            variant="text"
            size="small"
            prepend-icon="mdi-image"
            @click="openImages(item)"
          >
            {{ item.imageRefs.length }}
          </v-btn>
          <span v-else class="text-disabled">—</span>
        </template>

        <template v-slot:[`item.newPoints`]="{ item }">
          <v-chip v-if="item.newPoints > 0" color="green" size="small" variant="tonal" class="font-weight-medium">
            +{{ item.newPoints }} pts
          </v-chip>
          <span v-else class="text-disabled">—</span>
        </template>

        <template v-slot:[`item.newBadges`]="{ item }">
          <div v-if="(item.newBadges || []).length > 0" class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="badge in item.newBadges"
              :key="badge"
              color="purple"
              size="small"
              variant="tonal"
              prepend-icon="mdi-medal"
            >
              {{ badge }}
            </v-chip>
          </div>
          <span v-else class="text-disabled">—</span>
        </template>

        <template v-slot:[`item.contributesTo`]="{ item }">
          <v-chip v-if="item.contributesTo" color="green" variant="outlined" size="small">
            {{ $t('checkin.task_solved') }}
          </v-chip>
          <v-chip v-else color="gray" variant="outlined" size="small">
            {{ $t('checkin.no_contribution') }}
          </v-chip>
        </template>
      </v-data-table-server>
    </v-card>
  </v-window-item>

  <v-window-item value="stats">
    <v-row v-if="statsLoading" justify="center" class="my-6">
      <v-progress-circular indeterminate color="primary" />
    </v-row>
    <div v-else class="stats-panel pa-2">
      <!-- KPI Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-card class="pa-4 d-flex align-center ga-3">
            <v-avatar color="blue-lighten-5" size="56" class="text-primary">
              <v-icon size="32">mdi-check-bold</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ statsSummary.totalCheckins }}</div>
              <div class="text-caption text-secondary">Check-ins Totales</div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 d-flex align-center ga-3">
            <v-avatar color="amber-lighten-5" size="56" class="text-warning">
              <v-icon size="32">mdi-star</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ statsSummary.totalPoints }}</div>
              <div class="text-caption text-secondary">Puntos de Comunidad</div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="pa-4 d-flex align-center ga-3">
            <v-avatar color="purple-lighten-5" size="56" class="text-purple">
              <v-icon size="32">mdi-medal</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ statsSummary.totalBadges }}</div>
              <div class="text-caption text-secondary">Medallas Otorgadas</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <BarChart title="Colaboraciones por Área" :data="areaCheckinsChartData" />
        </v-col>
        <v-col cols="12" md="6">
          <BarChart title="Recompensas por Área" :data="areaRewardsChartData" />
        </v-col>
      </v-row>

      <!-- Breakdown Tables -->
      <v-card class="pa-4 mt-4">
        <h3 class="mb-3">Desglose de Colaboraciones</h3>
        <v-row>
          <v-col cols="12" md="6">
            <h4 class="mb-2">Por Área</h4>
            <v-data-table
              :headers="areaBreakdownHeaders"
              :items="statsData.byArea"
              hide-default-footer
              density="compact"
              class="border rounded"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-row dense>
              <v-col cols="12">
                <h4 class="mb-2">Por Tipo de Tarea</h4>
                <v-data-table
                  :headers="taskTypeBreakdownHeaders"
                  :items="statsData.byTaskType"
                  hide-default-footer
                  density="compact"
                  class="border rounded"
                />
              </v-col>
              <v-col cols="12" class="mt-4">
                <h4 class="mb-2">Por Intervalo de Tiempo</h4>
                <v-data-table
                  :headers="intervalBreakdownHeaders"
                  :items="statsData.byInterval"
                  hide-default-footer
                  density="compact"
                  class="border rounded"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-window-item>
</v-window>

    <!-- Image gallery dialog -->
    <v-dialog v-model="galleryOpen" max-width="90vw">
      <v-card>
        <v-card-title>{{ $t('admin.checkin_images') }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              v-for="key in gallery"
              :key="key"
              cols="6"
              sm="4"
              md="3"
            >
              <v-img
                :src="getImageUrl(key)"
                aspect-ratio="1"
                class="rounded-lg cursor-pointer"
                @click="zoom(key)"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="galleryOpen = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="zoomOpen" max-width="90vw">
      <v-card>
        <v-img :src="getImageUrl(zoomImage)" contain max-height="80vh" />
        <v-card-actions>
          <v-spacer />
          <v-btn @click="zoomOpen = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CheckinService from '@/services/CheckinService';
import ProjectsService from '@/services/ProjectsService';
import GamificationService from '@/services/GamificationService';
import AnalyticsService from '@/services/AnalyticsService';
import BreadCrumb from '@/components/utils/BreadCrumb.vue';
import LocationPicker from '@/components/LocationPicker.vue';
import BarChart from '@/components/analytics/BarChart.vue';

const { t } = useI18n();
const route = useRoute();

const projectId = computed(() => route.params.projectId);

// --- Tabs and Gamification config ------------------------------------------
const activeTab = ref('logs');
const gamificationBadges = ref([]);

// --- Filter state -----------------------------------------------------------
// `filters` is the *draft* the user is editing in the form. It is only
// pushed to the server when they hit "Apply", so unrelated keystrokes don't
// trigger requests.
const filters = reactive({
  taskName: '',
  taskType: null,
  badgeName: null,
  hasPhotos: null,
  contributed: null,
  dateFrom: '',
  dateTo: '',
  latitude: '',
  longitude: '',
  radiusKm: '',
});

// `appliedFilters` is what we actually send. We keep them separate so
// pagination interactions reuse the last applied snapshot.
const appliedFilters = reactive({ ...filters });

const sortOrder = ref('desc');
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const items = ref([]);
const loading = ref(false);

const taskTypeItems = ref([]);
const projectAreas = ref(null);
const locationPickerOpen = ref(false);

// Convenience accessor for the "is a center selected?" check. The picker
// always returns both lat and lng together, so checking lat is enough.
const locationCenter = computed(() => {
  if (filters.latitude !== '' && filters.longitude !== '') {
    return { latitude: filters.latitude, longitude: filters.longitude };
  }
  return null;
});

const onLocationPicked = ({ latitude, longitude }) => {
  filters.latitude = latitude;
  filters.longitude = longitude;
};

const clearLocation = () => {
  filters.latitude = '';
  filters.longitude = '';
  filters.radiusKm = '';
};

const hasPhotosItems = computed(() => [
  { title: t('common.any'), value: null },
  { title: t('admin.has_photos_yes'), value: 'true' },
  { title: t('admin.has_photos_no'), value: 'false' },
]);

const contributedItems = computed(() => [
  { title: t('common.any'), value: null },
  { title: t('admin.contributed_yes'), value: 'true' },
  { title: t('admin.contributed_no'), value: 'false' },
]);

const sortItems = computed(() => [
  { title: t('admin.sort_newest'), value: 'desc' },
  { title: t('admin.sort_oldest'), value: 'asc' },
]);

// The picker always sets lat+lng together, so the only partial state we
// have to guard against is "center selected but no (valid) radius". A
// radius without a center is impossible because the field is disabled
// in that case.
const locationFilterError = computed(() => {
  if (!locationCenter.value) return null;
  const radius = Number(filters.radiusKm);
  if (filters.radiusKm === '' || filters.radiusKm === null) {
    return t('admin.filter_location_missing_radius');
  }
  if (!Number.isFinite(radius) || radius <= 0) {
    return t('admin.filter_location_invalid_radius');
  }
  return null;
});

// All columns are non-sortable because we control sort order through the
// explicit "Order" dropdown in the toolbar. Letting users click headers
// would imply a server-side column sort I don't wanna add.
const headers = computed(() => [
  { title: t('common.datetime'), key: 'datetime', sortable: false },
  { title: t('admin.task_name_header'), key: 'taskName', sortable: false },
  { title: t('admin.task_type'), key: 'taskType', sortable: false },
  { title: t('admin.location_header'), key: 'location', sortable: false },
  { title: t('admin.images_header'), key: 'imageRefs', sortable: false },
  { title: t('admin.points_earned_header') || 'Puntos', key: 'newPoints', sortable: false },
  { title: t('admin.badges_earned_header') || 'Medallas', key: 'newBadges', sortable: false },
  { title: t('common.contributes_to'), key: 'contributesTo', sortable: false },
]);

// --- Image gallery ----------------------------------------------------------
const galleryOpen = ref(false);
const gallery = ref([]);
const zoomOpen = ref(false);
const zoomImage = ref('');

// Matches the URL builder in `UserCheckins.vue`. Param renamed from `ref`
// to `key` to avoid shadowing Vue's `ref` import in this file.
const getImageUrl = (key) => {
  if (!key) return '';
  if (key.startsWith('http')) return key;
  const baseUrl = import.meta.env.VITE_ROOT_API || 'http://localhost:3000/v1';
  return `${baseUrl}/storage/file?key=${key}`;
};

const openImages = (checkin) => {
  gallery.value = checkin.imageRefs || [];
  galleryOpen.value = true;
};

const zoom = (key) => {
  zoomImage.value = key;
  zoomOpen.value = true;
};

// --- Helpers ----------------------------------------------------------------
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const buildQuery = () => ({
  taskName: appliedFilters.taskName || undefined,
  taskType: appliedFilters.taskType || undefined,
  badgeName: appliedFilters.badgeName || undefined,
  hasPhotos: appliedFilters.hasPhotos || undefined,
  contributed: appliedFilters.contributed || undefined,
  dateFrom: appliedFilters.dateFrom ? new Date(appliedFilters.dateFrom).toISOString() : undefined,
  dateTo: appliedFilters.dateTo ? new Date(appliedFilters.dateTo).toISOString() : undefined,
  latitude: appliedFilters.latitude !== '' ? appliedFilters.latitude : undefined,
  longitude: appliedFilters.longitude !== '' ? appliedFilters.longitude : undefined,
  radiusKm: appliedFilters.radiusKm !== '' ? appliedFilters.radiusKm : undefined,
  page: page.value,
  limit: limit.value,
  sortOrder: sortOrder.value,
});

const reload = async () => {
  loading.value = true;
  try {
    const response = await CheckinService.getForAdmin(projectId.value, buildQuery());
    items.value = response?.items || [];
    total.value = response?.total || 0;
  } catch (e) {
    console.error('Failed to load admin checkins', e);
    items.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// React to page / page-size changes the table emits via v-model. A combined
// watcher avoids duplicate reloads when a page-size change also forces a
// page reset. We hold off on watching until the initial onMounted load
// finished so the first paint doesn't fire two requests.
const ready = ref(false);
watch([page, limit], ([newPage, newLimit], [, oldLimit]) => {
  if (!ready.value) return;
  // Limit changed → reset to page 1 (the watcher will fire again with the
  // new page) so the user doesn't land on an out-of-range page.
  if (newLimit !== oldLimit && newPage !== 1) {
    page.value = 1;
    return;
  }
  reload();
});

const applyFilters = () => {
  Object.assign(appliedFilters, filters);
  if (page.value !== 1) {
    page.value = 1; // triggers the watcher which calls reload()
  } else {
    reload();
  }
};

const resetFilters = () => {
  filters.taskName = '';
  filters.taskType = null;
  filters.badgeName = null;
  filters.hasPhotos = null;
  filters.contributed = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.latitude = '';
  filters.longitude = '';
  filters.radiusKm = '';
  applyFilters();
};

// --- Statistics state -------------------------------------------------------
const statsLoading = ref(false);
const statsData = ref({ byArea: [], byTaskType: [], byInterval: [] });

const loadStats = async () => {
  if (!projectId.value) return;
  statsLoading.value = true;
  try {
    const data = await AnalyticsService.getCommunityStats(projectId.value);
    statsData.value = data || { byArea: [], byTaskType: [], byInterval: [] };
  } catch (e) {
    console.error('Failed to load community statistics', e);
    statsData.value = { byArea: [], byTaskType: [], byInterval: [] };
  } finally {
    statsLoading.value = false;
  }
};

const statsSummary = computed(() => {
  const byArea = statsData.value.byArea || [];
  let totalCheckins = 0;
  let totalPoints = 0;
  let totalBadges = 0;
  for (const item of byArea) {
    totalCheckins += item.checkinsCount || 0;
    totalPoints += item.totalPoints || 0;
    totalBadges += item.totalBadges || 0;
  }
  return { totalCheckins, totalPoints, totalBadges };
});

const areaCheckinsChartData = computed(() => {
  const byArea = statsData.value.byArea || [];
  return {
    labels: byArea.map(a => a.areaName),
    datasets: [{
      label: t('admin.checkins_count') || 'Check-ins',
      data: byArea.map(a => a.checkinsCount),
      backgroundColor: '#1976D2',
    }],
  };
});

const areaRewardsChartData = computed(() => {
  const byArea = statsData.value.byArea || [];
  return {
    labels: byArea.map(a => a.areaName),
    datasets: [
      {
        label: t('admin.points_awarded') || 'Puntos',
        data: byArea.map(a => a.totalPoints),
        backgroundColor: '#F57C00',
      },
      {
        label: t('admin.badges_earned') || 'Medallas',
        data: byArea.map(a => a.totalBadges),
        backgroundColor: '#7B1FA2',
      }
    ],
  };
});

const areaBreakdownHeaders = computed(() => [
  { title: t('admin.area') || 'Área', key: 'areaName' },
  { title: t('admin.checkins_count') || 'Colaboraciones', key: 'checkinsCount' },
  { title: t('admin.points_awarded') || 'Puntos Otorgados', key: 'totalPoints' },
  { title: t('admin.badges_earned') || 'Medallas Otorgadas', key: 'totalBadges' },
]);

const taskTypeBreakdownHeaders = computed(() => [
  { title: t('admin.task_type') || 'Tipo de Tarea', key: 'taskType' },
  { title: t('admin.checkins_count') || 'Colaboraciones', key: 'checkinsCount' },
]);

const intervalBreakdownHeaders = computed(() => [
  { title: t('admin.interval') || 'Intervalo', key: 'timeIntervalId' },
  { title: t('admin.checkins_count') || 'Colaboraciones', key: 'checkinsCount' },
]);

// Reload when activeTab switches to 'stats'
watch(activeTab, (newTab) => {
  if (newTab === 'stats') {
    loadStats();
  }
});

// Reload whenever the project changes (e.g. user navigates between projects).
// Pause the page/limit watcher while we reset so we don't fire two reloads.
watch(projectId, async () => {
  ready.value = false;
  page.value = 1;
  await loadProjectMetadata();
  await loadGamificationMetadata();
  if (activeTab.value === 'stats') {
    await loadStats();
  } else {
    await reload();
  }
  ready.value = true;
});

const loadProjectMetadata = async () => {
  if (!projectId.value) return;
  try {
    const project = await ProjectsService.getProjectById(projectId.value);
    taskTypeItems.value = project?.taskTypes || [];
    projectAreas.value = project?.areas || null;
  } catch (e) {
    console.warn('Could not load project metadata for filters', e);
    taskTypeItems.value = [];
    projectAreas.value = null;
  }
};

const loadGamificationMetadata = async () => {
  if (!projectId.value) return;
  try {
    const config = await GamificationService.getGamification(projectId.value);
    gamificationBadges.value = config?.badges || [];
  } catch (e) {
    console.warn('Could not load gamification config for filters', e);
    gamificationBadges.value = [];
  }
};

onMounted(async () => {
  await loadProjectMetadata();
  await loadGamificationMetadata();
  if (activeTab.value === 'stats') {
    await loadStats();
  } else {
    await reload();
  }
  ready.value = true;
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
