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
    [...props.leaderboard]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .map((user, index) => ({
        position: index + 1,
        ...user,
      }))
);
</script>

<template>
  <v-container>
    <h2 class="mb-6">{{ $t('leaderboard.title') }}</h2>
    <v-data-table
        :headers="[
        { title: $t('leaderboard.position'), value: 'position' },
        { title: $t('leaderboard.name_header'), value: 'name' },
        { title: $t('leaderboard.score_header'), value: 'score' }
      ]"
        :items="leaderboardData"
        :no-data-text="$t('leaderboard.no_data')"
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
        <span>
          <template v-if="props.leaderboardStrategy === 'PUNTOS PRIMERO'">
            {{ $t('leaderboard.points', item.points || 0) }}
            &nbsp;|&nbsp;
            {{ $t('leaderboard.medals', item.badges?.length || 0) }}
          </template>
          <template v-else>
            {{ $t('leaderboard.medals', item.badges?.length || 0) }}
            &nbsp;|&nbsp;
            {{ $t('leaderboard.points', item.points || 0) }}
          </template>
        </span>
      </template>
    </v-data-table>
  </v-container>
</template>
