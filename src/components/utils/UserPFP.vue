<script setup lang="ts">

const props = defineProps({
  username: String,
})


function getUsernameInitial() {
  return props.username ? props.username.charAt(0).toUpperCase() : '';
}
</script>
<template>
  <div class="profile-initial">
    {{ getUsernameInitial() }}
  </div>
</template>
<style scoped>

.profile-initial {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00c4cc;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  font-size: 1rem;
}
</style>