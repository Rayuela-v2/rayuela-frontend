<template>
  <v-card class="pa-4">
    <div class="d-flex align-center justify-space-between flex-wrap mb-4 ga-2">
      <div class="text-h6">{{ title }}</div>
      <div v-if="legendItems && legendItems.length" class="d-flex align-center flex-wrap ga-3">
        <span
          v-for="item in legendItems"
          :key="item.label"
          class="d-inline-flex align-center text-caption"
        >
          <span
            :style="{
              width: '12px',
              height: '12px',
              backgroundColor: item.color,
              borderRadius: '3px',
              display: 'inline-block',
              marginRight: '6px',
            }"
          />
          {{ item.label }}
        </span>
      </div>
    </div>
    <div style="height: 300px; position: relative;">
      <Bar :data="data" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
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

const props = defineProps({
  title: String,
  data: {
    type: Object,
    required: true,
  },
  legendItems: {
    type: Array,
    default: () => [],
  },
  integerY: {
    type: Boolean,
    default: false,
  },
  maxY: {
    type: Number,
    default: undefined,
  },
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  datasets: {
    bar: {
      maxBarThickness: 72,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ...(props.maxY !== undefined ? { max: props.maxY } : {}),
      ticks: props.integerY ? { precision: 0 } : {},
    },
  },
}));
</script>
