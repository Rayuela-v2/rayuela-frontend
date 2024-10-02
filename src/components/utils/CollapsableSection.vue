<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  }
});

const isOpen = ref(false);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <v-card class="pa-4 mb-4">
    <v-row align="center" justify="space-between" @click="toggleOpen" style="cursor: pointer;">
      <h2>{{ props.title }}</h2>
      <v-icon>{{ isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-row>
    <v-expand-transition>
      <div v-show="isOpen">
        <hr>
        <slot />
      </div>
    </v-expand-transition>
  </v-card>
</template>
