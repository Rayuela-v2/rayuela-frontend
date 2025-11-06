<script setup>
import {computed} from 'vue';

const props = defineProps({
  leaderboard: {
    type: Array,
    required: true,
    default: () => [],
  },
  leaderboardStrategy: {
    type: String,
    required: false,
    default: 'PUNTOS PRIMERO',
  }
});

// Computed para mapear el leaderboard con la posición
const leaderboardData = computed(() =>
    props.leaderboard.map((user, index) => ({
      position: index + 1,
      ...user,
    }))
);
</script>

<template>
  <v-container>
    <h2 class="mb-6">Leaderboard</h2>
    <v-data-table
        :headers="[
        { title: 'Posición', value: 'position' },
        { title: 'Nombre', value: 'name' },
        { title: 'Puntuación', value: 'score' }
      ]"
        :items="leaderboardData"
        :no-data-text="'Aún no hay datos para mostrar.'"
        class="elevation-2"
        dense
        hide-default-footer
    >
      <!-- Columna de Posición -->
      <template #item.position="{ item }">
        <span v-if="item.position === 1">1🥇</span>
        <span v-else-if="item.position === 2">2🥈</span>
        <span v-else-if="item.position === 3">3🥉</span>
        <span v-else>{{ item.position }}</span>
      </template>

      <!-- Columna de Nombre -->
      <template #item.name="{ item }">
        <span>
          {{ item.completeName }}
        </span>
      </template>

      <!-- Columna de Puntuación -->
      <template #item.score="{ item }">
        <span v-if="props.leaderboardStrategy === 'PUNTOS PRIMERO'">
          {{ item.points || 0 }} punto<span v-if="!item.points || item.points !== 1">s</span>
        </span>
        <span v-else>
          {{ item.badges?.length || 0 }} medalla<span v-if="item.badges && item.badges.length !== 1">s</span>
        </span>
      </template>
    </v-data-table>
  </v-container>
</template>
