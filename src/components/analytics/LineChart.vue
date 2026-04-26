<template>
  <v-card class="pa-4">
    <div class="text-h6 mb-4">{{ title }}</div>
    <div style="height: 300px; position: relative;">
      <Line :data="data" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  TimeScale
);

const props = defineProps({
  title: String,
  data: {
    type: Object,
    required: true,
  },
  granularity: {
    type: String,
    default: 'week',
    validator: (v) => ['day', 'week', 'month'].includes(v),
  },
});

const DISPLAY_FORMATS = {
  day:   { day: 'MMM d', week: 'MMM d', month: 'MMM yyyy' },
  week:  { day: 'MMM d', week: 'MMM d', month: 'MMM yyyy' },
  month: { day: 'MMM d', week: 'MMM d', month: 'MMM yyyy' },
};

const TOOLTIP_FORMATS = {
  day:   'PP',
  week:  'PP',
  month: 'MMM yyyy',
};

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: props.granularity,
        tooltipFormat: TOOLTIP_FORMATS[props.granularity] ?? 'PP',
        displayFormats: DISPLAY_FORMATS[props.granularity],
      },
    },
    y: {
      beginAtZero: true,
    },
  },
}));
</script>
