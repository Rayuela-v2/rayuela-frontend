<template>
  <v-container v-if="project.userIsSubscribed">
    <RegisterCheckin :task-types="project.taskTypes"/>

    <h1 class="mb-6">Mi actividad</h1>

    <div class="pa-4 mb-6 badges-container">
      <div v-for="(badge, index) in badges" :key="index" class="badge-item">
        <img :src="badge.image" alt="Imagen de la insignia"/>
        <h6>{{ badge.name }}</h6>
      </div>
    </div>
    <Leaderboard/>
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
    <v-btn v-if="!project.userIsSubscribed" color="green" block large @click="subscribe">
      <v-icon left size="large">mdi-account-plus</v-icon>
      Inscribirse
    </v-btn>

    <!-- Áreas del Proyecto -->
    <GeoMap :visualization="true" v-if="project.areas && tasks.length" :tasks="tasks" :area="project.areas"/>

    <!-- Tabla de Tareas -->
    <div class="mt-6">
      <h2 class="mb-4">Tareas del Proyecto</h2>
      <v-select
          label="Filtrar por ID de Área"
          v-model="filterAreaId"
          :items="areaOptions"
          item-text="text"
          item-value="value"
          class="mb-4"
          clearable
      />
      <v-data-table
          :items="filteredTasks"
          :headers="taskHeaders"
          item-value="_id"
          dense
          class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Tareas</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import GeoMap from '@/views/Admin/GeoMap.vue';
import ProjectsService from '@/services/ProjectsService';
import TaskService from '@/services/TaskService';
import Leaderboard from '@/views/Leaderboard.vue';
import RegisterCheckin from '@/components/RegisterCheckin.vue';
import {toast} from "vue3-toastify";

const badges = [
  {
    name: "Sheriff",
    description: "Saca fotos cerca de la comisaria",
    image: "https://m.media-amazon.com/images/I/81EyITtF8jL._AC_UY1000_.jpg"
  },
  {
    name: "Explorador",
    description: "Realiza 10 tareas lejanas entre sí",
    image: "https://cdn5.vectorstock.com/i/1000x1000/65/29/explorer-adventure-outdoors-concept-badge-vector-28486529.jpg"
  },
  {
    name: "Formula 1",
    description: "Completa 3 formularios",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDbSpK8LgqhRSBtHki-YxnzThpo4t4H975kA&s"
  }
];

const route = useRoute();
const tasks = ref([]);
const filterAreaId = ref(null);

const project = ref({
  name: '',
  description: '',
  image: '',
  web: '',
  available: false,
  taskTypes: [],
  areas: null
});

const subscribe = () => {
  ProjectsService.toggleSubscription(route.params.projectId)
      .then(() => {
        toast.success("Inscripción exitosa");
        project.value.userIsSubscribed = true;
      });
}

const taskHeaders = [
  {title: 'Nombre', value: 'name'},
  {title: 'Descripción', value: 'description'},
  {title: 'ID de Área', value: 'areaId'},
  {title: 'Tipo', value: 'type'},
];

// Opciones para el desplegable de áreas
const areaOptions = computed(() => {
  if (!project.value.areas) return [];
  return tasks.value.map(t => t.areaId)
});

const filteredTasks = computed(() => {
  if (!filterAreaId.value) return tasks.value;
  return tasks.value.filter(task => task.areaId === filterAreaId.value);
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

.mt-6 {
  margin-top: 24px;
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