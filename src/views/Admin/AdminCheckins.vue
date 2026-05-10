<template>
  <v-container>
    <h1 class="mb-4">{{ $t('admin.checkins_title') }}</h1>

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
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.latitude"
            :label="$t('admin.filter_latitude')"
            type="number"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.longitude"
            :label="$t('admin.filter_longitude')"
            type="number"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.radiusKm"
            :label="$t('admin.filter_radius_km')"
            type="number"
            min="0"
            clearable
            hide-details
            density="compact"
            variant="outlined"
          />
        </v-col>
      </v-row>
      <v-row dense class="mt-2">
        <v-col cols="12" class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="resetFilters">{{ $t('admin.filter_reset') }}</v-btn>
          <v-btn color="primary" @click="applyFilters">{{ $t('admin.filter_apply') }}</v-btn>
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
        @update:options="onTableOptionsUpdate"
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

    <!-- Image gallery dialog -->
    <v-dialog v-model="galleryOpen" max-width="90vw">
      <v-card>
        <v-card-title>{{ $t('admin.checkin_images') }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
              v-for="(ref, idx) in gallery"
              :key="idx"
              cols="6"
              sm="4"
              md="3"
            >
              <v-img
                :src="getImageUrl(ref)"
                aspect-ratio="1"
                class="rounded-lg cursor-pointer"
                @click="zoom(ref)"
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

const { t } = useI18n();
const route = useRoute();

const projectId = computed(() => route.params.projectId);

// --- Filter state -----------------------------------------------------------
// `filters` is the *draft* the user is editing in the form. It is only
// pushed to the server when they hit "Apply", so unrelated keystrokes don't
// trigger requests.
const filters = reactive({
  taskName: '',
  taskType: null,
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

const headers = computed(() => [
  { title: t('common.datetime'), key: 'datetime' },
  { title: t('admin.task_name_header'), key: 'taskName' },
  { title: t('admin.task_type'), key: 'taskType' },
  { title: t('admin.location_header'), key: 'location', sortable: false },
  { title: t('admin.images_header'), key: 'imageRefs', sortable: false },
  { title: t('common.contributes_to'), key: 'contributesTo', sortable: false },
]);

// --- Image gallery ----------------------------------------------------------
const galleryOpen = ref(false);
const gallery = ref([]);
const zoomOpen = ref(false);
const zoomImage = ref('');

const getImageUrl = (ref) => {
  if (!ref) return '';
  if (ref.startsWith && ref.startsWith('http')) return ref;
  const baseUrl = import.meta.env.VITE_ROOT_API || 'http://localhost:3000/v1';
  return `${baseUrl}/storage/file?key=${ref}`;
};

const openImages = (checkin) => {
  gallery.value = checkin.imageRefs || [];
  galleryOpen.value = true;
};

const zoom = (ref) => {
  zoomImage.value = ref;
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

// vuetify's `<v-data-table-server>` re-emits options on every interaction
// (sort, page, page-size). We translate those into our own page/limit refs.
const onTableOptionsUpdate = ({ page: p, itemsPerPage }) => {
  let changed = false;
  if (p && p !== page.value) {
    page.value = p;
    changed = true;
  }
  if (itemsPerPage && itemsPerPage !== limit.value) {
    limit.value = itemsPerPage;
    changed = true;
  }
  if (changed) reload();
};

const applyFilters = () => {
  Object.assign(appliedFilters, filters);
  page.value = 1;
  reload();
};

const resetFilters = () => {
  filters.taskName = '';
  filters.taskType = null;
  filters.hasPhotos = null;
  filters.contributed = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.latitude = '';
  filters.longitude = '';
  filters.radiusKm = '';
  applyFilters();
};

// Reload whenever the project changes (e.g. user navigates between projects).
watch(projectId, async () => {
  page.value = 1;
  await loadProjectMetadata();
  await reload();
});

const loadProjectMetadata = async () => {
  if (!projectId.value) return;
  try {
    const project = await ProjectsService.getProjectById(projectId.value);
    taskTypeItems.value = project?.taskTypes || [];
  } catch (e) {
    console.warn('Could not load project metadata for filters', e);
    taskTypeItems.value = [];
  }
};

onMounted(async () => {
  await loadProjectMetadata();
  await reload();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
