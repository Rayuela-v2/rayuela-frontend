<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

import GamificationService from "@/services/GamificationService";
import UserPFP from "@/components/utils/UserPFP.vue";

const leaderboardData = ref([]);
const route = useRoute();

const fetchLeaderboard = async () => {
  try {
    leaderboardData.value = await GamificationService.getLeaderboardFor(route.params.projectId);
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
        <UserPFP :username="item.user.complete_name"/>
        <span>
          {{ item.user.complete_name }}
        </span>
      </template>

      <!-- Columna de Puntuación -->
      <template #item.score="{ item }">
        <span>{{ item.points }}</span>
      </template>
    </v-data-table>
  </v-container>
</template>
