<script setup>
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import ProjectsService from '@/services/ProjectsService';
import {toast} from 'vue3-toastify';
import GeoMap from "@/views/Admin/GeoMap.vue";
import CollapsableSection from "@/components/utils/CollapsableSection.vue";

const route = useRoute();
const project = ref({
  name: '',
  description: '',
  image: '',
  web: '',
  available: false,
  areas: null,
  taskTypes: [],
  timeIntervals: []
});

const areas = ref(null);
const isNew = ref(false);

const daysOfWeek = [
  {value: 1, text: 'Lunes'},
  {value: 2, text: 'Martes'},
  {value: 3, text: 'Miércoles'},
  {value: 4, text: 'Jueves'},
  {value: 5, text: 'Viernes'},
  {value: 6, text: 'Sábado'},
  {value: 7, text: 'Domingo'}
];

onMounted(async () => {
  const projectId = route.params.id;

  if (projectId === 'new') {
    isNew.value = true;
    project.value = {
      name: '',
      description: '',
      image: '',
      web: '',
      available: false,
      areas: [],
      taskTypes: [],
      timeIntervals: []
    };
  } else {
    const p = await ProjectsService.getProjectById(projectId);
    project.value = p;
    areas.value = p.areas;
  }
});

const saveProject = async () => {
  if (isNew.value) {
    await ProjectsService.createProject(project.value);
    toast.success('Proyecto creado exitosamente');
  } else {
    await ProjectsService.updateProject(project.value);
    toast.success('Proyecto actualizado exitosamente');
  }
};
</script>

<template>
  <v-container>
    <h1 class="mb-6">{{ isNew ? 'Crear nuevo proyecto' : 'Editar proyecto' }}</h1>

    <v-form @submit.prevent="saveProject">
      <!-- Información del proyecto -->
      <v-card class="pa-4 mb-6">
        <h2>Información del Proyecto</h2>
        <v-text-field label="Nombre del proyecto" v-model="project.name" required/>
        <v-textarea label="Descripción del proyecto" v-model="project.description" required/>
        <v-text-field label="URL de la imagen" v-model="project.image"/>
        <v-text-field label="Sitio web del proyecto" v-model="project.web"/>
        <v-switch label="Disponible" v-model="project.available" color="green"/>
      </v-card>

      <!-- Áreas -->
      <CollapsableSection title="Áreas">
        <p class="text-subtitle-1 mb-3">Define las áreas geográficas del proyecto</p>
        <GeoMap v-if="project.areas" :area="project.areas"/>
      </CollapsableSection>

      <!-- Tipos de Tareas -->
      <CollapsableSection title="Tipos de Tareas">
        <p class="text-subtitle-1 mb-3">Selecciona los tipos de tareas disponibles</p>
        <v-select
            v-model="project.taskTypes"
            :items="['Sacar fotos', 'Llenar formularios']"
            label="Tipos de tareas"
            multiple
            chips
        />
      </CollapsableSection>

      <!-- Intervalos de Tiempo -->
      <CollapsableSection title="Intervalos de Tiempo">
        <p class="text-subtitle-1 mb-3">Define los intervalos de tiempo y los días aplicables</p>
        <div v-for="(interval, index) in project.timeIntervals" :key="index" class="mb-4">
          <v-text-field label="Nombre del intervalo" v-model="interval.name"/>
          <v-range-slider
              :model-value="[interval.time.start,interval.time.end]"
              label="Intervalo de tiempo"
              :max="24"
              :min="0"
              ticks
              step="1"
              tick-size="2"
              thumb-label="always"
          />
          <h4>Días de la semana</h4>
          <v-checkbox
              v-for="day in daysOfWeek" :key="day.value"
              v-model="interval.days"
              :label="day.text"
              :value="day.value"
              hide-details
          />
        </div>
      </CollapsableSection>

      <!-- Botón de acción -->
      <v-btn type="submit" variant="elevated" color="primary" width="100%">{{ isNew ? 'Crear' : 'Actualizar' }}</v-btn>
    </v-form>
  </v-container>
</template>
