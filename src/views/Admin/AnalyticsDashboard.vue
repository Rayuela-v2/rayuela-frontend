<template>
  <v-container fluid>
    <v-row align="center" class="mb-4">
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
import * as AnalyticsService from '@/services/AnalyticsService';
import ProjectsService from '@/services/ProjectsService';
import SummaryCard from '@/components/analytics/SummaryCard.vue';
import LineChart from '@/components/analytics/LineChart.vue';
import BarChart from '@/components/analytics/BarChart.vue';

const store = useStore();
const token = computed(() => store.state.token);

// Filter state
const selectedProject = ref(null);
const granularity = ref('week');
const projects = ref([]);

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
  const t = token.value;

  try {
    const [s, c, a, p, b, st, cr] = await Promise.all([
      AnalyticsService.getSummary(t),
      AnalyticsService.getCheckinsOverTime(t, { projectId: pid, granularity: g }),
      AnalyticsService.getActiveUsersOverTime(t, { projectId: pid, granularity: g }),
      AnalyticsService.getPointsOverTime(t, { projectId: pid, granularity: g }),
      AnalyticsService.getBadgeAcquisitionOverTime(t, { projectId: pid, granularity: g }),
      AnalyticsService.getByStrategy(t),
      AnalyticsService.getContributionRate(t, { projectId: pid }),
    ]);

    summary.value = s.data;
    checkinsRaw.value = c.data;
    activeUsersRaw.value = a.data;
    pointsRaw.value = p.data;
    badgesRaw.value = b.data;
    strategyRaw.value = st.data;
    contributionRaw.value = cr.data;
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

watch([selectedProject, granularity], loadAnalytics);

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
