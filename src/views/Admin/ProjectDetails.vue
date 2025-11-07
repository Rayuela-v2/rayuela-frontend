<template>
  <v-container>
    <BreadCrumb items="projectDetailsPath"/>
    <h1 class="mb-6">Detalle del proyecto</h1>

    <v-form @submit.prevent="saveProject">
      <!-- Información del proyecto -->
      <v-card class="pa-4 mb-6">
        <h2>Información del Proyecto</h2>
        <v-text-field label="Nombre del proyecto" v-model="project.name" required/>
        <v-textarea label="Descripción del proyecto" v-model="project.description" required/>
        <v-text-field label="URL de la imagen" v-model="project.image"/>
        <v-text-field label="Sitio web del proyecto" v-model="project.web"/>
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
        <v-select
            label="Tipo de leaderboard"
            v-model="project.leaderboardStrategy"
            :items="['PUNTOS PRIMERO', 'MEDALLAS PRIMERO']"
            required
        ></v-select>
        <v-select
            label="Algoritmo de recomendación"
            v-model="project.recommendationStrategy"
            :items="['SIMPLE', 'ADAPTATIVO']"
            required
        ></v-select>
        <v-switch label="Disponible" v-model="project.available" color="green"/>
        <v-switch label="Checkins con ubicación manual" v-model="project.manualLocation" color="green"/>
      </v-card>

      <v-dialog v-model="gamificationDialog" max-width="500px">
        <v-card>
          <v-card-title>¿Qué es una adaptación de ludificación?</v-card-title>
          <v-card-text>
            <p>Las estrategias de adaptación permiten adecuar los elementos de juego a cada persona en un contexto
              determinado. En este proyecto, puedes elegir entre:</p>
            <ul>
              <li><strong>Básica:</strong> Aplica reglas predefinidas sin adaptación dinámica.</li>
              <li><strong>Elástica:</strong> El cálculo de retribución de puntos es relativo a la posición de cada
                persona en la tabla de posiciones. Si está más lejos, el puntaje es mayor que si está cerca.
              </li>
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
        <GeoMap v-if="project.areas" :area="project.areas" @update-area="updateProjectAreas"/>
      </CollapsableSection>

      <CollapsableSection title="Tipos de Tareas">
        <p class="text-subtitle-1 mb-3">Tabla de tipos de tareas</p>
        <v-row>
          <v-col cols="10">
            <v-text-field v-model="newTaskType" label="Añadir nuevo tipo de tarea"
                          placeholder="Escribe un tipo de tarea"/>
          </v-col>
          <v-col cols="2">
            <v-btn color="black" @click="addNewTaskType">Agregar</v-btn>
          </v-col>
        </v-row>

        <v-row>
        <v-table style="width: 100%;">
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
        </v-table>
        </v-row>
      </CollapsableSection>
      <!-- Intervalos de Tiempo -->
      <CollapsableSection title="Intervalos de Tiempo">
        <p class="text-subtitle-1 mb-3">Define los intervalos de tiempo y los días aplicables</p>

        <v-btn color="primary" class="mb-4" @click="addNewTimeInterval">
          Añadir nuevo intervalo de tiempo
        </v-btn>

        <CollapsableSection style="background: whitesmoke; padding: 2em"
                            v-for="(interval, index) in project.timeIntervals"
                            :key="index" class="mb-4" :title="interval.name || 'Nuevo Intervalo'">
          <v-text-field label="Nombre del intervalo" v-model="interval.name" required/>

          <v-row>
            <v-col cols="6">
              <v-text-field
                  label="Fecha de inicio"
                  type="date"
                  v-model="interval.startDate"
                  step="1"
                  required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                  label="Fecha de finalización"
                  type="date"
                  v-model="interval.endDate"
                  step="1"
                  required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select
                :items="Array.from({length: 24}, (_, i) => i)"
                v-model="interval.time.start"
                label="Hora de inicio"
                :hint="`El valor seleccionado será ${interval.time.start}:00`"
                persistent-hint
                required
              />
            </v-col>
            <v-col cols="6">
              <v-select
                :items="Array.from({length: 24}, (_, i) => i + 1)"
                v-model="interval.time.end"
                label="Hora de finalización"
                :hint="`El valor seleccionado será ${interval.time.end}:00`"
                persistent-hint
                required
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

          <!-- Mostrar advertencias de validación -->
          <v-alert v-if="!isValidInterval(interval) && interval.name" type="error" variant="outlined" class="mt-4">
            El intervalo debe tener un nombre, un horario válido y al menos un día seleccionado.
          </v-alert>
        </CollapsableSection>
      </CollapsableSection>
      <CollapsableSection title="Tareas" @click="taskSectionClick">
      </CollapsableSection>
      <v-btn type="submit" variant="elevated" color="primary" width="100%" :disabled="hasInvalidTimeIntervals">
        {{ isNew ? 'Crear' : 'Actualizar' }}
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import ProjectsService from '@/services/ProjectsService';
import {toast} from 'vue3-toastify';
import CollapsableSection from '@/components/utils/CollapsableSection.vue';
import GeoMap from "@/views/Admin/GeoMap.vue";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";
import router from "@/router";

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
  manualLocation: false,
});

const daysOfWeek = [
  {value: 1, text: 'Lunes'},
  {value: 2, text: 'Martes'},
  {value: 3, text: 'Miércoles'},
  {value: 4, text: 'Jueves'},
  {value: 5, text: 'Viernes'},
  {value: 6, text: 'Sábado'},
  {value: 7, text: 'Domingo'}
];

const newTaskType = ref('');
const isNew = ref(false);
const gamificationDialog = ref(false);

const taskSectionClick = () => {
  saveProject().then((project) => {
    router.push(`/admin/project/${project._id}/tasks`)
  })
}
const updateProjectAreas = (newAreas) => {
  project.value.areas = newAreas;
  toast.success('Áreas actualizadas correctamente');
};

// Computed para saber si hay intervalos de tiempo inválidos
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
  confirm('Si borras un tipo de tarea se eliminaran todas las tareas que lo contienen, quieres continuar?')
  project.value.taskTypes.splice(index, 1);
};

// Validar si un intervalo de tiempo es válido
const isValidInterval = (interval) => {
  const start = interval.time.start;
  const end = interval.time.end;
  return interval.name.trim() !== '' &&
      start < end &&
      interval.startDate < interval.endDate &&
      interval.days.length > 0;
};

const addNewTimeInterval = () => {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  project.value.timeIntervals.push({
    name: '',
    time: {start: 0, end: 0},
    days: [],
    startDate: new Date(),
    endDate: nextYear,
  });
};

const removeTimeInterval = (index) => {
  confirm('Si borras un intervalo de tiempo se eliminaran todas las tareas que lo contienen, quieres continuar?')
  project.value.timeIntervals.splice(index, 1);
  toast.info('Intervalo eliminado');
};

const saveProject = async () => {
  // Formatea los intervalos de tiempo antes de enviar
  const formattedIntervals = project.value.timeIntervals.map(interval => ({
    ...interval,
    time: {
      start: typeof interval.time.start === 'number'
        ? `${interval.time.start.toString().padStart(2, '0')}:00:00`
        : interval.time.start,
      end: typeof interval.time.end === 'number'
        ? `${(interval.time.end - 1).toString().padStart(2, '0')}:59:59`
        : interval.time.end,
    }
  }));

  if (isNew.value) {
    return ProjectsService.createProject({
      ...project.value,
      timeIntervals: formattedIntervals
    }).then((r) => {
      toast.success('Proyecto creado exitosamente');
      return r;
    });
  } else {
    // Divide el payload para evitar que sea demasiado grande
    const {areas, ...projectWithoutAreas} = project.value;
    return Promise.all([
      ProjectsService.updateProject({
        ...projectWithoutAreas,
        timeIntervals: formattedIntervals
      }),
      ProjectsService.updateProject({id: project.value.id, areas}),
    ]).then(([r]) => {
      toast.success('Proyecto actualizado exitosamente');
      return r;
    });
  }
};


onMounted(async () => {
  const projectId = route.params.projectId;
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
      timeIntervals: [],
      gamificationStrategy: 'BASICA',
      manualLocation: false,
    };
  } else {
const fetchedProject = await ProjectsService.getProjectById(projectId);
    fetchedProject.timeIntervals = fetchedProject.timeIntervals.map(interval => ({
      ...interval,
      time: {
        start: typeof interval.time.start === 'string'
          ? Number(interval.time.start.split(':')[0])
          : interval.time.start,
        end: typeof interval.time.end === 'string'
          ? Number(interval.time.end.split(':')[0])
          : interval.time.end,
      }
    }));
    project.value = fetchedProject;  }
});
</script>
