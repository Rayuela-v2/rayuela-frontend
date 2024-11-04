<script setup>
import NavBar from './components/NavBar.vue';
import TheFooter from './components/TheFooter.vue';
</script>

<template>
  <header>
    <NavBar/>

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
