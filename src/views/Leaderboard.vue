<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const leaderboardData = ref([]);

const fetchLeaderboard = async () => {
  try {
    const response = await store.dispatch('getLeaderboard');
    leaderboardData.value = response.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error al cargar el leaderboard:', error);
  }
};

onMounted(() => {
  fetchLeaderboard();
});
</script>

<template>
  <v-container>
    <h1 class="mb-6">Leaderboard</h1>
    <v-data-table
        :headers="[
        { title: 'Posición', value: 'position' },
        { title: 'Nombre', value: 'name' },
        { title: 'Puntuación', value: 'score' }
      ]"
        :items="leaderboardData.map((user, index) => ({
        position: index + 1,
        ...user,
      }))"
        class="elevation-2"
        dense
        hide-default-footer
    >
      <template #item.position="{ item }">
        <span v-if="item.position === 1">1🥇</span>
        <span v-else-if="item.position === 2">2🥈</span>
        <span v-else-if="item.position === 3">3🥉</span>
        <span v-else>{{ item.position }}</span>
      </template>

      <template #item.name="{ item }">
        <v-avatar size="36" class="me-3">
          <img :src="item.avatarUrl" alt="Avatar" />
        </v-avatar>
        <span>
          {{ item.name }}
        </span>
      </template>

      <!-- Columna de Puntuación -->
      <template #item.score="{ item }">
        <span>{{ item.score }}</span>
      </template>
    </v-data-table>
  </v-container>
</template>
