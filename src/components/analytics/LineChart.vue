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
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  TimeScale,
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
  integerY: {
    type: Boolean,
    default: true,
  },
});

const { locale } = useI18n();

const DATE_FNS_LOCALES = {
  ES: es,
  EN: enUS,
  PT: ptBR,
};

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
  adapters: {
    date: {
      locale: DATE_FNS_LOCALES[String(locale.value).toUpperCase()] || es,
    },
  },
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
      ticks: props.integerY ? { precision: 0 } : {},
    },
  },
}));
</script>
