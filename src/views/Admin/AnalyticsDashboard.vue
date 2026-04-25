<template>
  <v-container fluid>
    <v-row align="center" class="mb-2">
      <v-col cols="12" md="4">
        <h1 class="text-h4">{{ $t('admin.analytics_dashboard') }}</h1>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProject"
          :items="projectItems"
          label="Project"
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
          <v-btn value="day">Day</v-btn>
          <v-btn value="week">Week</v-btn>
          <v-btn value="month">Month</v-btn>
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
          <v-btn value="last7days">Last 7 days</v-btn>
          <v-btn value="last30days">Last 30 days</v-btn>
          <v-btn value="last3months">Last 3 months</v-btn>
          <v-btn value="alltime">All time</v-btn>
          <v-btn value="custom">Custom</v-btn>
        </v-btn-toggle>

        <!-- Custom date inputs — visible only when preset is 'custom' -->
        <span v-if="datePreset === 'custom'" class="ml-4 d-inline-flex align-center ga-2">
          <v-text-field
            v-model="customStart"
            label="From"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
          />
          <v-text-field
            v-model="customEnd"
            label="To"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
          />
        </span>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="2.4" v-for="card in summaryCards" :key="card.title">
        <SummaryCard :title="card.title" :value="card.value" :format="card.format" />
      </v-col>
    </v-row>

    <!-- Time Series Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <LineChart title="Check-ins Over Time" :data="checkinsData" />
      </v-col>
      <v-col cols="12" md="6">
        <LineChart title="Active Users Over Time" :data="activeUsersData" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <LineChart title="Points Awarded Over Time" :data="pointsData" />
      </v-col>
      <v-col cols="12" md="6">
        <LineChart title="Badges Earned Over Time" :data="badgesData" />
      </v-col>
    </v-row>

    <!-- Strategy and Contribution Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <BarChart title="Check-ins by Strategy" :data="strategyCheckinsData" />
      </v-col>
      <v-col cols="12" md="6">
        <BarChart title="Avg Points per Check-in by Strategy" :data="strategyPointsData" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <BarChart title="Contribution Rate by Project" :data="contributionData" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AnalyticsService from '@/services/AnalyticsService';
import ProjectsService from '@/services/ProjectsService';
import SummaryCard from '@/components/analytics/SummaryCard.vue';
import LineChart from '@/components/analytics/LineChart.vue';
import BarChart from '@/components/analytics/BarChart.vue';

const store = useStore();

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
  { title: 'All Projects', value: null },
  ...projects.value.map(p => ({ title: p.name, value: p._id }))
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
      AnalyticsService.getByStrategy(),
      AnalyticsService.getContributionRate({ projectId: pid }),
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

const router = useRouter();

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
  { title: 'Total Check-ins', value: summary.value.totalCheckins },
  { title: 'Active Users', value: summary.value.totalActiveUsers },
  { title: 'Contribution Rate', value: summary.value.overallContributionRate, format: 'percent' },
  { title: 'Badges Earned', value: summary.value.totalBadgesEarned },
  { title: 'Points Awarded', value: summary.value.totalPointsAwarded },
]);

function toLineData(raw, valueKey, label, color) {
  return {
    labels: raw.map(d => d.period),
    datasets: [{
      label,
      data: raw.map(d => d[valueKey]),
      borderColor: color,
      backgroundColor: color + '33', // Add some transparency for the fill
      fill: true,
      tension: 0.4,
    }],
  };
}

const checkinsData = computed(() => toLineData(checkinsRaw.value, 'count', 'Check-ins', '#1976D2'));
const activeUsersData = computed(() => toLineData(activeUsersRaw.value, 'uniqueUsers', 'Active Users', '#388E3C'));
const pointsData = computed(() => toLineData(pointsRaw.value, 'totalPoints', 'Points', '#F57C00'));
const badgesData = computed(() => toLineData(badgesRaw.value, 'count', 'Badges', '#7B1FA2'));

const strategyCheckinsData = computed(() => ({
  labels: strategyRaw.value.map(s => s.projectName),
  datasets: [{
    label: 'Check-ins',
    data: strategyRaw.value.map(s => s.checkinCount),
    backgroundColor: strategyRaw.value.map(s =>
      s.gamificationStrategy === 'ELASTICA' ? '#F57C00' : '#1976D2'
    ),
  }],
}));

const strategyPointsData = computed(() => ({
  labels: strategyRaw.value.map(s => s.projectName),
  datasets: [{
    label: 'Avg pts / check-in',
    data: strategyRaw.value.map(s => s.avgPointsPerCheckin),
    backgroundColor: strategyRaw.value.map(s =>
      s.gamificationStrategy === 'ELASTICA' ? '#F57C00' : '#1976D2'
    ),
  }],
}));

const contributionData = computed(() => ({
  labels: contributionRaw.value.map(p => p.projectName),
  datasets: [{
    label: 'Contribution Rate (%)',
    data: contributionRaw.value.map(p => +(p.rate * 100).toFixed(1)),
    backgroundColor: '#388E3C',
  }],
}));
</script>
