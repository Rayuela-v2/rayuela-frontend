<template>
  <v-container>
    <BreadCrumb items="projectDetailsPath" />
    <h1 class="mb-6">Detalle del proyecto</h1>

    <v-form @submit.prevent="saveProject">
      <!-- Información del proyecto -->
      <v-card class="pa-4 mb-6">
        <h2>Información del Proyecto</h2>
        <v-text-field label="Nombre del proyecto" v-model="project.name" required />
        <v-textarea label="Descripción del proyecto" v-model="project.description" required />
        <v-text-field label="URL de la imagen" v-model="project.image" />
        <v-text-field label="Sitio web del proyecto" v-model="project.web" />
        <v-select
            label="Tipo de adaptación"
            v-model="project.gamificationStrategy"
            :items="['ELASTICA', 'SIN ADAPTACION']"
            required
        >
          <template v-slot:append>
            <v-icon @click="showGamificationInfo">mdi-information</v-icon>
          </template>
        </v-select>
        <v-switch label="Disponible" v-model="project.available" color="green" />
      </v-card>

      <v-dialog v-model="gamificationDialog" max-width="500px">
        <v-card>
          <v-card-title>¿Qué es una adaptación de ludificación?</v-card-title>
          <v-card-text>
            <p>La gamificación es una estrategia que utiliza elementos de juego en contextos no lúdicos. En este proyecto, puedes elegir entre:</p>
            <ul>
              <li><strong>Elástica:</strong> Se ajusta dinámicamente a las necesidades del usuario.</li>
              <li><strong>Básica:</strong> Aplica reglas predefinidas sin adaptación dinámica.</li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="gamificationDialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Áreas -->
      <CollapsableSection title="Áreas">
        <p class="text-subtitle-1 mb-3">Define las áreas geográficas del proyecto</p>
        <GeoMap v-if="project.areas" :area="project.areas" @update-area="updateProjectAreas" />
      </CollapsableSection>

      <CollapsableSection title="Tipos de Tareas">
        <p class="text-subtitle-1 mb-3">Tabla de tipos de tareas</p>
        <v-row>
          <v-col cols="10">
            <v-text-field v-model="newTaskType" label="Añadir nuevo tipo de tarea" placeholder="Escribe un tipo de tarea" />
          </v-col>
          <v-col cols="2">
            <v-btn color="black" @click="addNewTaskType">Agregar</v-btn>
          </v-col>
        </v-row>

        <v-simple-table class="mt-4">
          <thead>
          <tr>
            <th>Tipo de Tarea</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(taskType, index) in project.taskTypes" :key="index">
            <td>{{ taskType }}</td>
            <td>
              <v-btn icon variant="text" @click="removeTaskType(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
          </tbody>
        </v-simple-table>
      </CollapsableSection>

      <v-btn type="submit" variant="elevated" color="primary" width="100%" :disabled="hasInvalidTimeIntervals">
        {{ isNew ? 'Crear' : 'Actualizar' }}
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import ProjectsService from '@/services/ProjectsService';
import { toast } from 'vue3-toastify';
import CollapsableSection from '@/components/utils/CollapsableSection.vue';
import router from "@/router";
import GeoMap from "@/views/Admin/GeoMap.vue";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";

const route = useRoute();
const project = ref({
  _id: '',
  name: '',
  description: '',
  image: '',
  web: '',
  available: false,
  areas: null,
  taskTypes: [],
  timeIntervals: [],
  gamificationStrategy: null,
});

const newTaskType = ref('');
const isNew = ref(false);
const gamificationDialog = ref(false);

const hasInvalidTimeIntervals = computed(() => {
  return project.value.timeIntervals.some(interval => !isValidInterval(interval));
});

const showGamificationInfo = () => {
  gamificationDialog.value = true;
};

const addNewTaskType = () => {
  const taskType = newTaskType.value.trim();
  if (taskType && !project.value.taskTypes.includes(taskType)) {
    project.value.taskTypes.push(taskType);
    toast.success(`Tarea "${taskType}" añadida`);
    newTaskType.value = '';
  }
};

const removeTaskType = (index) => {
  project.value.taskTypes.splice(index, 1);
  toast.info('Tarea eliminada');
};

onMounted(async () => {
  const projectId = route.params.projectId;
  if (projectId === 'new') {
    isNew.value = true;
    project.value = { _id: '', name: '', description: '', image: '', web: '', available: false, areas: [], taskTypes: [], timeIntervals: [], gamificationStrategy: 'BASICA' };
  } else {
    const p = await ProjectsService.getProjectById(projectId);
    project.value = p;
  }
});
</script>