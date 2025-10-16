<script setup>
import {computed} from 'vue';

const props = defineProps({
  leaderboard: {
    type: Array,
    required: true,
    default: () => [],
  },
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
        <!--        <UserPFP :username="item.completeName"/>-->
        <span>
          {{ item.completeName }}
        </span>
      </template>

      <!-- Columna de Puntuación -->
      <template #item.score="{ item }">
        <span>{{ item.points }}</span>
      </template>
    </v-data-table>
  </v-container>
</template>
