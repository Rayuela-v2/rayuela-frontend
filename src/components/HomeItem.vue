<script setup>

</script>

<template>
  <div class="container">
    <h2 class="title">{{ $t("projects.title") }}</h2>
    <h3 class="subtitle">{{ $t("projects.subtitle") }} </h3>
  </div>
</template>

<style scoped>
.title, .subtitle{
  text-align: center;
  font-size: large;
}

.container{
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
}
</style>
