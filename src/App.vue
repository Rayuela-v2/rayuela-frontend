<script setup>
import NavBar from './components/NavBar.vue';
import TheFooter from './components/TheFooter.vue';
import LoadingOverlay from "@/components/LoadingOverlay.vue";
</script>

<template>
  <header>
    <NavBar/>
    <LoadingOverlay />
  </header>

  <div class="container">
    <RouterView/>
  </div>

  <footer>
    <TheFooter/>
  </footer>

</template>

<style>
</style>
