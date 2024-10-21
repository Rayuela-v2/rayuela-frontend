<template>
  <v-container>
    <h1 class="mb-6">Detalle del proyecto</h1>

    <v-form @submit.prevent="saveProject">
      <!-- Información del proyecto -->
      <v-card class="pa-4 mb-6">
        <h2>Información del Proyecto</h2>
        <v-text-field label="Nombre del proyecto" v-model="project.name" required />
        <v-textarea label="Descripción del proyecto" v-model="project.description" required />
        <v-text-field label="URL de la imagen" v-model="project.image" />
        <v-text-field label="Sitio web del proyecto" v-model="project.web" />
        <v-switch label="Disponible" v-model="project.available" color="green" />
      </v-card>

      <!-- Áreas -->
      <CollapsableSection title="Áreas">
        <p class="text-subtitle-1 mb-3">Define las áreas geográficas del proyecto</p>
        <GeoMap v-if="project.areas" :area="project.areas" />
      </CollapsableSection>

      <!-- Tipos de Tareas -->
      <CollapsableSection title="Tipos de Tareas">
        <p class="text-subtitle-1 mb-3">Tabla de tipos de tareas</p>

        <!-- Campo para agregar nuevos tipos de tarea -->
        <v-row>
          <v-col cols="10">
            <v-text-field
                v-model="newTaskType"
                label="Añadir nuevo tipo de tarea"
                placeholder="Escribe un tipo de tarea"
            />
          </v-col>
          <v-col cols="2">
            <v-btn color="black" @click="addNewTaskType">Agregar</v-btn>
          </v-col>
        </v-row>

        <!-- Tabla de tipos de tareas -->
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

      <CollapsableSection title="Intervalos de Tiempo">
        <p class="text-subtitle-1 mb-3">Define los intervalos de tiempo y los días aplicables</p>

        <v-btn color="primary" class="mb-4" @click="addNewTimeInterval">
          Añadir nuevo intervalo de tiempo
        </v-btn>

        <v-card style="background: whitesmoke; padding: 2em" v-for="(interval, index) in project.timeIntervals" :key="index" class="mb-4">
          <v-text-field label="Nombre del intervalo" v-model="interval.name" />

          <v-row>
            <v-col cols="6">
              <v-text-field
                  label="Hora de inicio"
                  type="number"
                  v-model="interval.time.start"
                  :min="0"
                  :max="24"
                  step="1"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                  label="Hora de finalización"
                  type="number"
                  v-model="interval.time.end"
                  :min="0"
                  :max="24"
                  step="1"
              />
            </v-col>
          </v-row>

          <h4>Días de la semana</h4>
          <v-checkbox
              v-for="day in daysOfWeek"
              :key="day.value"
              v-model="interval.days"
              :label="day.text"
              :value="day.value"
              hide-details
          />

          <v-btn color="red" @click="removeTimeInterval(index)">Eliminar intervalo</v-btn>
        </v-card>
      </CollapsableSection>

      <CollapsableSection title="Tareas" @click="taskSectionClick">
      </CollapsableSection>

      <v-btn type="submit" variant="elevated" color="primary" width="100%">
        {{ isNew ? 'Crear' : 'Actualizar' }}
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ProjectsService from '@/services/ProjectsService';
import { toast } from 'vue3-toastify';
import CollapsableSection from '@/components/utils/CollapsableSection.vue';
import router from "@/router";
import GeoMap from "@/views/Admin/GeoMap.vue";

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
  timeIntervals: []
});

const newTaskType = ref('');
const areas = ref(null);
const isNew = ref(false);
const daysOfWeek = [
  { value: 1, text: 'Lunes' },
  { value: 2, text: 'Martes' },
  { value: 3, text: 'Miércoles' },
  { value: 4, text: 'Jueves' },
  { value: 5, text: 'Viernes' },
  { value: 6, text: 'Sábado' },
  { value: 7, text: 'Domingo' }
];

const taskSectionClick = () => {
  saveProject().then((project) => {
    router.push(`/admin/project/${project._id}/tasks`)
  })
}

const addNewTaskType = () => {
  const taskType = newTaskType.value.trim();
  if (taskType && !project.value.taskTypes.includes(taskType)) {
    project.value = {...project.value, taskTypes: project.value.taskTypes.concat([taskType])};
    toast.success(`Tarea "${taskType}" añadida`);
    newTaskType.value = '';
  }
};

const removeTaskType = (index) => {
  project.value.taskTypes.splice(index, 1);
  toast.info('Tarea eliminada');
};

onMounted(async () => {
  const projectId = route.params.id;

  if (projectId === 'new') {
    isNew.value = true;
    project.value = {
      _id: '',
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

const addNewTimeInterval = () => {
  project.value.timeIntervals.push({
    name: '',
    time: { start: 0, end: 0 },
    days: []
  });
};

const removeTimeInterval = (index) => {
  project.value.timeIntervals.splice(index, 1);
  toast.info('Intervalo eliminado');
};

const saveProject = () => {
  if (isNew.value) {
    return ProjectsService.createProject(project.value).then((r) => {
      toast.success('Proyecto creado exitosamente');
      return r;
    });
  } else {
    return ProjectsService.updateProject(project.value).then((r) => {
      toast.success('Proyecto actualizado exitosamente');
      return r;
    });
  }
};
</script>
