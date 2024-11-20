<script setup>
import Dashboard from '../components/TheDashboard.vue'
import {onMounted} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()

onMounted(() => {
  if(localStorage.getItem('role') === 'Admin') {
    router.push('/admin');
  }
})

const goToLeaderboard = () => {
  router.push('/leaderboard')
}
</script>

<template>
  <main>
    <v-btn @click="goToLeaderboard">Ver leaderboard</v-btn>
    <Dashboard />
  </main>
</template>
