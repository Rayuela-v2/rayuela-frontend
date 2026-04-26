<template>
  <v-card class="pa-4">
    <div class="text-h6 mb-4">{{ title }}</div>
    <div style="height: 300px; position: relative;">
      <Bar :data="data" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

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
    y: {
      beginAtZero: true,
    },
  },
};
</script>
