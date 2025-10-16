<template>
  <div v-if="isLoading" class="loading-backdrop">
    <img src="/public/logoRayuelaHorizontal.ico" alt="Cargando..." class="loading-logo" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {loadingService} from "@/services/loadingService";

const isLoading = computed(() => loadingService.isLoading);
</script>

<style scoped>
.loading-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-logo {
  width: 150px;
  height: auto;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
