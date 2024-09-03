<script setup>
import axios from 'axios'
import {ref, onMounted} from 'vue'
import 'vue3-toastify/dist/index.css';
import ProjectCard from "@/components/ProjectCard.vue";
import ViewMoreButton from "@/components/ViewMoreButton.vue";

const projects = ref([])
const errors = []

onMounted(async () => {
  const token = localStorage.getItem("token")
  const headers = {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }
  try {
    const response = await axios.get(import.meta.env.VITE_ROOT_API + `/projects_diff/`, headers)
    projects.value = response.data.slice(0, 3)
    console.log(projects)
  } catch (e) {
    errors.push(e)
  }
})

</script>

<template>
  <h2 class="subtitle">Proyectos disponibles</h2>
  <div class="container">
    <div v-for="project in projects" :key="project.id">
      <ProjectCard :project="project"/>
    </div>
    <ViewMoreButton />
  </div>
</template>

<style scoped>

.card image {
  max-width: 100%;
}

.card title {
  font-size: small;
}

.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.subtitle {
  display: flex;
  flex-wrap: wrap;
  font-size: large;
  justify-content: center;
  padding: 10px;
}

</style>
