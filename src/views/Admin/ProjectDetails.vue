<template>
  <v-container>
    <BreadCrumb items="projectDetailsPath"/>
    <h1 class="mb-6">{{ $t('admin.project_detail') }}</h1>

    <v-form @submit.prevent="saveProject">
      <!-- Información del proyecto -->
      <v-card class="pa-4 mb-6">
        <h2>{{ $t('admin.project_info') }}</h2>
        <v-text-field :label="$t('admin.project_name')" v-model="project.name" required/>
        <v-textarea :label="$t('admin.project_description_label')" v-model="project.description" required/>
        <v-text-field :label="$t('admin.project_image_label')" v-model="project.image"/>
        <v-text-field :label="$t('admin.project_website_label')" v-model="project.web"/>
        <v-select
            :label="$t('admin.adaptation_type_label')"
            v-model="project.gamificationStrategy"
            :items="['ELASTICA', 'SIN ADAPTACION']"
            required
        >
          <template v-slot:append>
            <v-icon @click="showGamificationInfo">mdi-information</v-icon>
          </template>
        </v-select>
        <v-select
            :label="$t('admin.leaderboard_type_label')"
            v-model="project.leaderboardStrategy"
            :items="['PUNTOS PRIMERO', 'MEDALLAS PRIMERO']"
            required
        ></v-select>
        <v-select
            :label="$t('admin.recommendation_algorithm_label')"
            v-model="project.recommendationStrategy"
            :items="['SIMPLE', 'ADAPTATIVO']"
            required
        ></v-select>
        <v-switch :label="$t('project.status_available')" v-model="project.available" color="green"/>
        <v-switch :label="$t('admin.manual_location_switch')" v-model="project.manualLocation" color="green"/>
      </v-card>

      <v-dialog v-model="gamificationDialog" max-width="500px">
        <v-card>
          <v-card-title>{{ $t('admin.gamification_info_title') }}</v-card-title>
          <v-card-text>
            <p>{{ $t('admin.gamification_info_text') }}</p>
            <ul>
              <li><strong>{{ $t('admin.basic') }}:</strong> Aplica reglas predefinidas sin adaptación dinámica.</li>
              <li><strong>{{ $t('admin.elastic') }}:</strong> El cálculo de retribución de puntos es relativo a la posición de cada
                persona en la tabla de posiciones. Si está más lejos, el puntaje es mayor que si está cerca.
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="gamificationDialog = false">{{ $t('common.close') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Áreas -->
      <CollapsableSection :title="$t('admin.areas_title')">
        <p class="text-subtitle-1 mb-3">{{ $t('admin.define_areas') }}</p>
        <GeoMap v-if="project.areas" :area="project.areas" @update-area="updateProjectAreas"/>
      </CollapsableSection>

      <CollapsableSection :title="$t('admin.task_types_title')">
        <p class="text-subtitle-1 mb-3">{{ $t('admin.task_types_table') }}</p>
        <v-row>
          <v-col cols="10">
            <v-text-field v-model="newTaskType" :label="$t('admin.add_task_type_label')"
                          :placeholder="$t('admin.task_type_placeholder')"/>
          </v-col>
          <v-col cols="2">
            <v-btn color="black" @click="addNewTaskType">{{ $t('common.add') }}</v-btn>
          </v-col>
        </v-row>

        <v-row>
        <v-table style="width: 100%;">
          <thead>
          <tr>
            <th>{{ $t('admin.task_type') }}</th>
            <th>{{ $t('common.actions') }}</th>
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
      <CollapsableSection :title="$t('admin.time_intervals_title')">
        <p class="text-subtitle-1 mb-3">{{ $t('admin.define_intervals') }}</p>

        <v-btn color="primary" class="mb-4" @click="addNewTimeInterval">
          {{ $t('admin.add_time_interval_button') }}
        </v-btn>

        <CollapsableSection style="background: whitesmoke; padding: 2em"
                            v-for="(interval, index) in project.timeIntervals"
                            :key="index" class="mb-4" :title="interval.name || $t('admin.new_interval_placeholder')">
          <v-text-field :label="$t('admin.interval_name_label')" v-model="interval.name" required/>

          <v-row>
            <v-col cols="6">
              <v-text-field
                  :label="$t('admin.start_date_label')"
                  type="date"
                  v-model="interval.startDate"
                  step="1"
                  required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                  :label="$t('admin.end_date_label')"
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
                :label="$t('admin.start_hour_label')"
                :hint="t('admin.time_hint', { time: interval.time.start })"
                persistent-hint
                required
              />
            </v-col>
            <v-col cols="6">
              <v-select
                :items="Array.from({length: 24}, (_, i) => i + 1)"
                v-model="interval.time.end"
                :label="$t('admin.end_hour_label')"
                :hint="t('admin.time_hint', { time: interval.time.end })"
                persistent-hint
                required
              />
            </v-col>
          </v-row>
          <h4>{{ $t('admin.days_of_week') }}</h4>
          <v-checkbox
              v-for="(day, idx) in daysOfWeek"
              :key="day.value"
              v-model="interval.days"
              :label="$t('common.days')[idx + 1] === undefined ? $t('common.days')[0] : $t('common.days')[idx + 1]"
              :value="day.value"
              hide-details
          />

          <v-btn color="red" @click="removeTimeInterval(index)">{{ $t('admin.remove_interval') }}</v-btn>

          <!-- Mostrar advertencias de validación -->
          <v-alert v-if="!isValidInterval(interval) && interval.name" type="error" variant="outlined" class="mt-4">
            {{ $t('admin.invalid_interval_alert') }}
          </v-alert>
        </CollapsableSection>
      </CollapsableSection>
      <CollapsableSection :title="$t('admin.task_management') " @click="taskSectionClick">
      </CollapsableSection>
      <v-btn type="submit" variant="elevated" color="primary" width="100%" :disabled="hasInvalidTimeIntervals">
        {{ isNew ? $t('common.add') : $t('admin.project_updated_success').split(' ')[1] }}
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
  toast.success(t('admin.areas_updated_success'));
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
    toast.success(t("admin.task_type_added_success", { type: taskType }));
    newTaskType.value = '';
  }
};

const removeTaskType = (index) => {
  confirm(t('admin.confirm_delete_task_type'))
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
  confirm(t('admin.confirm_delete_interval'))
  project.value.timeIntervals.splice(index, 1);
  toast.info(t('admin.interval_removed_success'));
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
      toast.success(t('admin.project_created_success'));
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
      toast.success(t('admin.project_updated_success'));
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
