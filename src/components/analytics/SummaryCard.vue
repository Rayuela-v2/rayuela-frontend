<template>
  <v-card class="mx-auto" variant="outlined">
    <v-list-item>
      <v-list-item-title class="text-overline mb-4">{{ title }}</v-list-item-title>
      <v-list-item-subtitle class="text-h4 mb-1">
        {{ formattedValue }}
      </v-list-item-subtitle>
    </v-list-item>
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
    return `${(props.value * 100).toFixed(1)}%`;
  }
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value || '0';
});
</script>
