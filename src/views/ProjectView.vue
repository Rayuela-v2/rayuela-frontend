<template>
  <v-container v-if="project.userIsSubscribed">
    <h1 class="mb-6">Mi actividad</h1>

    <div class="pa-4 mb-6 badges-container">
      <div v-for="(badge, index) in badges" :key="index" class="badge-item">
        <img :src="badge.image" alt="Imagen de la insignia"/>
        <h6>{{ badge.name }}</h6>
      </div>
    </div>

  </v-container>
  <v-container>
    <h1 class="mb-6">Detalle del Proyecto</h1>

    <!-- Información del Proyecto -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="6">
          <v-img :src="project.image" alt="Imagen del proyecto" class="mb-4" contain/>
        </v-col>
        <v-col cols="12" md="6">
          <h2>{{ project.name }}</h2>
          <p class="text-subtitle-1 mb-3">{{ project.description }}</p>
          <v-btn :href="project.web" target="_blank" color="primary" class="mb-2">
            Visitar Sitio Web
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Áreas del Proyecto -->
    <GeoMap :visualization="true" v-if="project.areas && tasks.length" :tasks="tasks" :area="project.areas" />

  </v-container>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import GeoMap from '@/views/Admin/GeoMap.vue';
import ProjectsService from "@/services/ProjectsService";
import TaskService from "@/services/TaskService";

const badges = [
  {
    name: "Sheriff",
    description: "Saca fotos cerca de la comisaria",
    image: "https://m.media-amazon.com/images/I/81EyITtF8jL._AC_UY1000_.jpg"
  },
  {
    name: "Explorador",
    description: "Realiza 10 tareas lejanas entre si",
    image: "https://cdn5.vectorstock.com/i/1000x1000/65/29/explorer-adventure-outdoors-concept-badge-vector-28486529.jpg"
  },
  {
    name: "Formula 1",
    description: "Completa 3 formularios",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDbSpK8LgqhRSBtHki-YxnzThpo4t4H975kA&s"
  },
]
const route = useRoute();
const tasks = ref([])
const project = ref({
  name: '',
  description: '',
  image: '',
  web: '',
  available: false,
  taskTypes: [],
  areas: null
});

onMounted(async () => {
  project.value = await ProjectsService.getProjectById(route.params.projectId);
  tasks.value = await TaskService.getTaskForProject(route.params.projectId);
});
</script>

<style scoped>
.mb-6 {
  margin-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.text-subtitle-1 {
  font-size: 16px;
  color: #555;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.badge-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.badge-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>