<template>
  <v-container fluid>
    <BreadCrumb items="analyticsPath" />

    <v-row align="center" class="mb-2">
      <v-col cols="12" md="4">
        <h1 class="text-h4">{{ $t('admin.analytics_dashboard') }}</h1>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProject"
          :items="projectItems"
          :label="$t('admin.analytics_project_label')"
          clearable
          hide-details
          variant="outlined"
          density="compact"
        ></v-select>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn-toggle
          v-model="granularity"
          mandatory
          color="primary"
          variant="outlined"
          density="compact"
        >
          <v-btn value="day">{{ $t('admin.analytics_granularity_day') }}</v-btn>
          <v-btn value="week">{{ $t('admin.analytics_granularity_week') }}</v-btn>
          <v-btn value="month">{{ $t('admin.analytics_granularity_month') }}</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Date range row -->
    <v-row align="center" class="mb-4">
      <v-col cols="12">
        <v-btn-toggle
          v-model="datePreset"
          mandatory
          color="secondary"
          variant="outlined"
          density="compact"
          class="flex-wrap"
        >
          <v-btn value="last7days">{{ $t('admin.analytics_preset_last7days') }}</v-btn>
          <v-btn value="last30days">{{ $t('admin.analytics_preset_last30days') }}</v-btn>
          <v-btn value="last3months">{{ $t('admin.analytics_preset_last3months') }}</v-btn>
          <v-btn value="alltime">{{ $t('admin.analytics_preset_alltime') }}</v-btn>
          <v-btn value="custom">{{ $t('admin.analytics_preset_custom') }}</v-btn>
        </v-btn-toggle>

        <!-- Custom date inputs — visible only when preset is 'custom' -->
        <span v-if="datePreset === 'custom'" class="ml-4 d-inline-flex align-center ga-2">
          <v-text-field
            v-model="customStart"
            :label="$t('admin.filter_date_from')"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
          />
          <v-text-field
            v-model="customEnd"
            :label="$t('admin.filter_date_to')"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
          />
        </span>
      </v-col>
    </v-row>

    <!-- Summary Cards: 5 equal columns on desktop -->
    <div class="summary-grid mb-6">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :format="card.format"
      />
    </div>

    <!-- Time Series Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <LineChart
          :title="$t('admin.analytics_chart_checkins_over_time')"
          :data="checkinsData"
          :granularity="granularity"
          :integer-y="true"
        />
      </v-col>
      <v-col cols="12" md="6">
        <LineChart
          :title="$t('admin.analytics_chart_active_users_over_time')"
          :data="activeUsersData"
          :granularity="granularity"
          :integer-y="true"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <LineChart
          :title="$t('admin.analytics_chart_points_over_time')"
          :data="pointsData"
          :granularity="granularity"
          :integer-y="true"
        />
      </v-col>
      <v-col cols="12" md="6">
        <LineChart
          :title="$t('admin.analytics_chart_badges_over_time')"
          :data="badgesData"
          :granularity="granularity"
          :integer-y="true"
        />
      </v-col>
    </v-row>

    <!-- Strategy and Contribution Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <BarChart
          :title="$t('admin.analytics_chart_checkins_by_strategy')"
          :data="strategyCheckinsData"
          :legend-items="strategyLegendItems"
          :integer-y="true"
        />
      </v-col>
      <v-col cols="12" md="6">
        <BarChart
          :title="$t('admin.analytics_chart_avg_points_by_strategy')"
          :data="strategyPointsData"
          :legend-items="strategyLegendItems"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <BarChart
          :title="$t('admin.analytics_chart_contribution_rate')"
          :data="contributionData"
          :max-y="100"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AnalyticsService from '@/services/AnalyticsService';
import ProjectsService from '@/services/ProjectsService';
import BreadCrumb from '@/components/utils/BreadCrumb.vue';
import SummaryCard from '@/components/analytics/SummaryCard.vue';
import LineChart from '@/components/analytics/LineChart.vue';
import BarChart from '@/components/analytics/BarChart.vue';
import {
  STRATEGY_METADATA,
  fillTimeSeries,
  getStrategyColor,
  getStrategyLabel,
} from '@/utils/analyticsChartUtils';

const { t } = useI18n();
const router = useRouter();

// Filter state
const selectedProject = ref(null);
const granularity = ref('week');
const projects = ref([]);

// Date range state
const datePreset = ref('last30days'); // 'last7days' | 'last30days' | 'last3months' | 'alltime' | 'custom'
const customStart = ref(null); // ISO date string 'YYYY-MM-DD' or null
const customEnd = ref(null);   // ISO date string 'YYYY-MM-DD' or null

const PRESETS = {
  last7days:    () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return { s, e }; },
  last30days:   () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { s, e }; },
  last3months:  () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth() - 3); return { s, e }; },
  alltime:      () => null,
};

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

const dateRange = computed(() => {
  if (datePreset.value === 'custom') {
    return { startDate: customStart.value || undefined, endDate: customEnd.value || undefined };
  }
  if (datePreset.value === 'alltime') return {};
  const range = PRESETS[datePreset.value]?.();
  if (!range) return {};
  return { startDate: toISODate(range.s), endDate: toISODate(range.e) };
});

const projectItems = computed(() => [
  { title: t('admin.analytics_all_projects'), value: null },
  ...projects.value.map(p => ({ title: p.name, value: p._id })),
]);

// Raw API data
const summary = ref({});
const checkinsRaw = ref([]);
const activeUsersRaw = ref([]);
const pointsRaw = ref([]);
const badgesRaw = ref([]);
const strategyRaw = ref([]);
const contributionRaw = ref([]);

async function loadProjects() {
  projects.value = await ProjectsService.getAdminProjects();
}

async function loadAnalytics() {
  const pid = selectedProject.value;
  const g = granularity.value;
  const dr = dateRange.value;

  try {
    const [s, c, a, p, b, st, cr] = await Promise.all([
      AnalyticsService.getSummary({ projectId: pid, ...dr }),
      AnalyticsService.getCheckinsOverTime({ projectId: pid, granularity: g, ...dr }),
      AnalyticsService.getActiveUsersOverTime({ projectId: pid, granularity: g, ...dr }),
      AnalyticsService.getPointsOverTime({ projectId: pid, granularity: g, ...dr }),
      AnalyticsService.getBadgeAcquisitionOverTime({ projectId: pid, granularity: g, ...dr }),
      AnalyticsService.getByStrategy({ projectId: pid, ...dr }),
      AnalyticsService.getContributionRate({ projectId: pid, ...dr }),
    ]);

    summary.value = s;
    checkinsRaw.value = c;
    activeUsersRaw.value = a;
    pointsRaw.value = p;
    badgesRaw.value = b;
    strategyRaw.value = st;
    contributionRaw.value = cr;
  } catch (error) {
    console.error('Failed to load analytics data:', error);
  }
}

onMounted(() => {
  if (localStorage.getItem('role') !== 'Admin') {
    router.push('/');
    return;
  }
  loadProjects();
  loadAnalytics();
});

watch([selectedProject, granularity, datePreset, customStart, customEnd], loadAnalytics);

const summaryCards = computed(() => [
  { title: t('admin.analytics_kpi_total_checkins'), value: summary.value.totalCheckins },
  { title: t('admin.analytics_kpi_active_users'), value: summary.value.totalActiveUsers },
  { title: t('admin.analytics_kpi_contribution_rate'), value: summary.value.overallContributionRate, format: 'percent' },
  { title: t('admin.analytics_kpi_badges_earned'), value: summary.value.totalBadgesEarned },
  { title: t('admin.analytics_kpi_points_awarded'), value: summary.value.totalPointsAwarded },
]);

function toLineData(raw, valueKey, label, color) {
  const filled = fillTimeSeries(
    raw,
    valueKey,
    granularity.value,
    dateRange.value.startDate,
    dateRange.value.endDate,
  );
  return {
    labels: filled.map(d => d.period),
    datasets: [{
      label,
      data: filled.map(d => d[valueKey]),
      borderColor: color,
      backgroundColor: color + '33',
      fill: true,
      tension: 0.3,
    }],
  };
}

const checkinsData = computed(() =>
  toLineData(checkinsRaw.value, 'count', t('admin.analytics_series_checkins'), '#1976D2'),
);
const activeUsersData = computed(() =>
  toLineData(activeUsersRaw.value, 'uniqueUsers', t('admin.analytics_series_active_users'), '#388E3C'),
);
const pointsData = computed(() =>
  toLineData(pointsRaw.value, 'totalPoints', t('admin.analytics_series_points'), '#F57C00'),
);
const badgesData = computed(() =>
  toLineData(badgesRaw.value, 'count', t('admin.analytics_series_badges'), '#7B1FA2'),
);

const strategyLegendItems = computed(() =>
  Object.entries(STRATEGY_METADATA).map(([, meta]) => ({
    label: t(meta.i18nKey),
    color: meta.color,
  })),
);

const strategyLabels = computed(() =>
  strategyRaw.value.map(
    s => `${s.projectName} (${getStrategyLabel(s.gamificationStrategy, t)})`,
  ),
);

const strategyCheckinsData = computed(() => ({
  labels: strategyLabels.value,
  datasets: [{
    label: t('admin.analytics_series_checkins'),
    data: strategyRaw.value.map(s => s.checkinCount),
    backgroundColor: strategyRaw.value.map(s => getStrategyColor(s.gamificationStrategy)),
  }],
}));

const strategyPointsData = computed(() => ({
  labels: strategyLabels.value,
  datasets: [{
    label: t('admin.analytics_series_avg_points'),
    data: strategyRaw.value.map(s => +Number(s.avgPointsPerCheckin || 0).toFixed(1)),
    backgroundColor: strategyRaw.value.map(s => getStrategyColor(s.gamificationStrategy)),
  }],
}));

const contributionData = computed(() => ({
  labels: contributionRaw.value.map(p => p.projectName),
  datasets: [{
    label: t('admin.analytics_series_contribution_rate'),
    data: contributionRaw.value.map(p => +(p.rate * 100).toFixed(1)),
    backgroundColor: '#388E3C',
  }],
}));
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
</style>
