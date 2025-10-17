<template>
  <v-container v-if="project.user?.isSubscribed">
    <!-- Información del Proyecto -->
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="6">
          <v-img :src="project.image" alt="Imagen del proyecto" class="mb-4" contain/>
        </v-col>
        <v-col cols="12" md="6">
          <h2>{{ project.name }}</h2>
          <p class="text-subtitle-1 mb-3" v-html="project.description.replace(/\n/g, '<br>')"></p>
          <v-btn :href="project.web" target="_blank" color="primary" class="mb-2">
            Visitar Sitio Web
          </v-btn>
          <v-btn
              color="blue"
              class="mb-2 ml-2"
              @click="shareProject"
          >
            <v-icon left>mdi-share</v-icon>
            Compartir
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <hr>
    <!-- Áreas del Proyecto -->
    <GeoMap :visualization="true" v-if="project.areas" :tasks="tasks" :area="project.areas"
            @selected-area="updateSelectedArea"/>
    <small>Puedes clickear las areas para filtrar tareas ☝️</small>
    <!-- Tabla de Tareas -->
    <div class="mt-6">
      <v-data-table
          :items="formattedTasks"
          :no-data-text="'Aún no hay datos para mostrar.'"
          :headers="taskHeaders"
          item-value="formatted"
          dense
          class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>
              <div style="display: flex; justify-content: space-between; margin-right: 8px">
                Tareas {{ filterAreaId && ` del área ${filterAreaId}` }}
                <v-btn v-if="filterAreaId" variant="outlined" @click="clearFilter">Limpiar filtro</v-btn>
              </div>
            </v-toolbar-title>
          </v-toolbar>
        </template>

        <!-- Slot para modificar la visualización de las filas -->
        <template v-slot:item="{ item }">
          <tr :class="{ 'resolved-task': item.solved }">
            <td>
              <span :class="{ 'text-decoration-line-through': item.solved }">
              {{ item.formatted }}
              <v-badge v-if="item.solved" color="green" content="Resuelta" inline></v-badge>
              <v-badge v-if="!item.solved" color='blue' content="Pendiente" inline></v-badge>
        </span>
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <RegisterCheckin @modalClosed="handleModalClosed"
                     :task-types="project.taskTypes"
                     :manual-location-enabled="project.manualLocation"
                     class="floating-button"
    />

    <h2>Medallas</h2>
    <div class="pa-4 mb-6 badges-container">
      <v-alert title="Sin medallas"
               color="gray"
               variant="tonal"
               v-if="project.user.badges.length === 0">Aun no tienes medallas, quieres comenzar con un checkin?
      </v-alert>
      <div v-for="(badge, index) in project.user.badges" :key="index" class="badge-item">
        <img
            :src="badge.imageUrl"
            alt="Imagen de la insignia"
            :class="{ 'grayscale': !badge.active }"
            @click="toggleTooltip(index)"
        />
        <v-tooltip :v-model="badgeTooltip === index" activator="parent">
    <span>
      {{ badge.checkinsAmount }} checkins en área {{ badge.areaId }} tipo de tarea {{
        badge.taskType
      }} intervalo {{ badge.timeIntervalId }}
    </span>
        </v-tooltip>
        <h6>{{ badge.name }}</h6>
      </div>
    </div>
    <h2>Puntos</h2>
    <h3>Tienes {{ project.user.points }}pts</h3>
    <Leaderboard :leaderboard="leaderboard"/>
  </v-container>
  <v-container>
    <h1 class="mb-6">Detalle del Proyecto</h1>

    <!-- Sección de explicación de intervalos de tiempo -->
    <h2>Intervalos de tiempo</h2>
    <v-card class="pa-4 mb-6">
      <p>
        Los intervalos de tiempo definen en qué días y horarios se pueden realizar tareas específicas en el proyecto.
      </p>
      <ul>
        <li v-for="interval in project.timeIntervals" :key="interval._id">
          <strong>{{ interval.name }}</strong>:
          <span>
                De {{ interval.time.start }}:00 a {{ interval.time.end }}:00 hs,
                los días
                <span v-for="(day, idx) in interval.days" :key="day">
                  {{
                    ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day]
                  }}<span v-if="idx < interval.days.length - 1">, </span>
                </span>
              </span>
        </li>
      </ul>
    </v-card>

    <h2>Tipos de tarea</h2>
    <v-card class="pa-4 mb-6">
      <ul>
        <li v-for="(type, idx) in project.taskTypes" :key="idx">
          <strong>{{ type }}</strong>
        </li>
      </ul>
    </v-card>
    <v-btn v-if="!project.user?.isSubscribed" color="green" block large @click="subscribe">
      <v-icon left size="large">mdi-account-plus</v-icon>
      Inscribirse
    </v-btn>
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
import GamificationService from "@/services/GamificationService";

const route = useRoute();
const tasks = ref([]);
const leaderboard = ref([]);
const filterAreaId = ref(null);

const badgeTooltip = ref(-1);

const toggleTooltip = (index) => {
  badgeTooltip.value = index;
};

const project = ref({
  name: '',
  description: '',
  image: '',
  web: '',
  available: false,
  taskTypes: [],
  areas: null
});

const clearFilter = () => {
  filterAreaId.value = null;
};

const subscribe = () => {
  ProjectsService.toggleSubscription(route.params.projectId)
      .then(async () => {
        toast.success("Inscripción exitosa");
        project.value = await ProjectsService.getProjectById(route.params.projectId);
      });
}

const taskHeaders = [
  {title: 'Detalle de la Tarea', value: 'formatted'},
];

const handleModalClosed = async () => {
  project.value = await ProjectsService.getProjectById(route.params.projectId);
  leaderboard.value = (await GamificationService.getLeaderboardFor(route.params.projectId))?.users;
};

const updateSelectedArea = (areaId) => {
  filterAreaId.value = areaId;
};

const filteredTasks = computed(() => {
  if (!filterAreaId.value) return tasks.value;
  return tasks.value.filter(task => task.areaGeoJSON.properties.id === filterAreaId.value);
});

const shareProject = () => {
  const text = `¡Hola!  Querés jugar en rayuela? :) ${project.value.name}`;
  if (navigator.share) {
    navigator.share({
      title: project.value.name,
      text,
      url: `https://rayuela-frontend.vercel.app/public/project/${project.value.id}/view`,
    });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
};

const formattedTasks = computed(() => {
  return filteredTasks.value.map(task => ({
    formatted: `${task.points}pts - ${task.timeInterval.name} - ${task.type}`,
    solved: task.solved
  }));
});

onMounted(async () => {
  project.value = await ProjectsService.getProjectById(route.params.projectId);
  tasks.value = await TaskService.getTaskForProject(route.params.projectId);
  leaderboard.value = (await GamificationService.getLeaderboardFor(route.params.projectId))?.users;
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

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.resolved-task {
  background-color: #e0e0e0 !important;
}

.text-decoration-line-through {
  text-decoration: line-through;
  color: #757575;
}

.grayscale {
  filter: grayscale(70%) brightness(85%);
  opacity: 0.2;
}
</style>
