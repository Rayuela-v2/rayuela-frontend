<template>
  <v-card class="mx-auto pa-2 text-center" variant="outlined" min-height="100">
    <div class="text-overline mb-1 text-grey-darken-1 text-truncate">{{ title }}</div>
    <div class="text-h5 font-weight-bold">
      {{ formattedValue }}
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: [Number, String],
  format: {
    type: String,
    default: 'number',
  },
});

const formattedValue = computed(() => {
  if (props.format === 'percent') {
    return `${((props.value || 0) * 100).toFixed(1)}%`;
  }
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value || '0';
});
</script>
