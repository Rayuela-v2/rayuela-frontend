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
</script>

<template>
  <main>
    <Dashboard />
  </main>
</template>
