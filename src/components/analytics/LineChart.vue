<template>
  <v-card class="pa-4">
    <div class="text-h6 mb-4">{{ title }}</div>
    <div style="height: 300px; position: relative;">
      <Line :data="data" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script setup>
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

defineProps({
  title: String,
  data: {
    type: Object,
    required: true,
  },
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        tooltipFormat: 'PP',
        displayFormats: {
          day: 'MMM d',
          week: 'MMM d',
          month: 'MMM yyyy',
        },
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};
</script>
