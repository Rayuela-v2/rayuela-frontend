<template>
  <v-container v-if="project.user?.isSubscribed">
    <h1>{{ project.name }} </h1>
    <hr>
    <!-- Áreas del Proyecto -->
    <GeoMap :visualization="true"
            v-if="project.areas && checkins !== null" :checkins="checkins" :tasks="tasks" :area="project.areas"
            @selected-area="updateSelectedArea"
    />
    <small>Puedes clickear las areas para filtrar tareas ☝️</small>
    <v-alert v-if="project.gamificationStrategy === 'ELASTICA'" type="info" variant="outlined" class="mt-4">
      Estás jugando en modo <strong style="color: blue">turbo</strong>. Si estas en muy lejos del primer puesto, vas a
      obtener puntos extra por cada tarea 🔥
    </v-alert>
    <!-- Tabla de Tareas -->
    <div class="mt-6">
      <v-data-table
          :items="formattedTasks"
          :no-data-text="'Aún no hay datos para mostrar.'"
          :headers="taskHeaders"
          item-value="formatted"
          dense
          class="elevation-1"
          :search="tableSearch"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title style="flex:1">
              <div style="display: flex; justify-content: space-between; margin-right: 8px">
                Tareas
              </div>
            </v-toolbar-title>
            <v-text-field
                v-model="tableSearch"
                placeholder="Buscar tareas..."
                clearable
                dense
                hide-details
                style="max-width: 300px"
            />
          </v-toolbar>
        </template>

        <!-- Slot para modificar la visualización de las filas -->
        <template v-slot:item="{ item }">
          <tr :class="{ 'resolved-task': item.solved }" @click.stop="showTaskDetail(item)" style="cursor: pointer">
            <td>
              <span :class="{ 'text-decoration-line-through': item.solved }">
                {{ item.formatted }}
                <v-badge
                    v-if="item.solved"
                    color="green"
                    :content="`Resuelta por ${item.solvedBy}`"
                    inline
                ></v-badge>
                <v-badge
                    v-if="!item.solved"
                    color="blue"
                    content="Pendiente"
                    inline
                ></v-badge>
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
        <h6>{{ badge.name }}</h6>
      </div>
      <v-dialog v-model="taskDetailDialog" max-width="500">
        <v-card v-if="taskDetail">
          <v-card-title class="headline">Detalle de la tarea</v-card-title>
          <v-card-text>
            <p>{{
                taskDetail.taskDescription
              }}</p>
            <p><strong>Intervalo de tiempo:</strong> {{
                taskDetail.intervalDescription || taskDetail.timeInterval?.name
              }}</p>
            <p><strong>Tipo de tarea:</strong> {{ taskDetail.type }}</p>
            <p v-if="taskDetail.timeInterval">
              <strong>Horario:</strong>
              De {{ taskDetail.timeInterval?.time?.start }} a {{ (taskDetail.timeInterval?.time?.end ?? '') }}
              hs
            </p>
            <p v-if="taskDetail.timeInterval?.days">
              <strong>Días:</strong>
              <span v-for="(day, idx) in taskDetail.timeInterval.days" :key="day">
          {{
                  ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day - 1]
                }}<span v-if="idx < taskDetail.timeInterval.days.length - 1">, </span>
        </span>
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn text @click="taskDetailDialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showBadgeDialog" max-width="500">
        <v-card v-if="selectedBadge">
          <v-card-title class="headline">{{ selectedBadge.name }}</v-card-title>
          <v-card-text>
            <div style="display:flex; gap:16px; align-items:flex-start">
              <img :src="selectedBadge.imageUrl" alt="" width="90" height="90"/>
              <div>
                <p><strong>Reglas para ganarla:</strong></p>
                <ul>
                  <li>Medallas previas: {{
                      selectedBadge.previousBadges.length > 0 ? selectedBadge.previousBadges.toString() : 'Ninguna'
                    }}
                  </li>
                  <li>Cantidad de checkins: {{ selectedBadge.checkinsAmount }}</li>
                  <li v-if="selectedBadge.mustContribute">(Tienen que resolver una tarea)</li>
                  <li>Area: {{ selectedBadge.areaId }}</li>
                  <li>Intervalo de tiempo: {{ selectedBadge.timeIntervalId }}</li>
                  <li>Tipo de tarea: {{ selectedBadge.taskType }}</li>
                </ul>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn text @click="showBadgeDialog = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <h2>Puntos</h2>
    <h3>Tienes {{ project.user.points }}pts</h3>
    <Leaderboard :leaderboard="leaderboard" :leaderboardStrategy="project.leaderboardStrategy"/>
    <UserCheckins :checkins="checkins"/>
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
                De {{ interval.time.start }} a {{ interval.time.end }} hs,
                los días
                <span v-for="(day, idx) in interval.days" :key="day">
                  {{
                    ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day - 1]
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
  </v-container>
  <v-container v-if="!project.user?.isSubscribed">
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
    <v-btn color="green" block large @click="subscribe">
      <v-icon left size="large">mdi-account-plus</v-icon>
      Inscribirse
    </v-btn>
  </v-container>
  <v-btn
      color="blue"
      class="mb-2 ml-2"
      @click="shareProject"
  >
    <v-icon left>mdi-share</v-icon>
    Compartir proyecto
  </v-btn>
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
import CheckinService from "@/services/CheckinService";
import UserCheckins from "@/components/UserCheckins.vue";

const route = useRoute();
const tasks = ref([]);
const leaderboard = ref([]);
const checkins = ref(null);
const tableSearch = ref('');
const taskDetailDialog = ref(false);
const taskDetail = ref(null);
const badgeTooltip = ref(-1);

const toggleTooltip = (index) => {
  badgeTooltip.value = index;
};

const showBadgeDialog = computed({
  get: () => badgeTooltip.value !== -1,
  set: (val) => {
    if (!val) badgeTooltip.value = -1;
  }
});

function showTaskDetail(item) {
  taskDetail.value = item;
  taskDetailDialog.value = true;
}

const selectedBadge = computed(() => {
  return badgeTooltip.value === -1 ? null : project.value.user?.badges?.[badgeTooltip.value] ?? null;
});

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
  checkins.value = await CheckinService.getByProject(route.params.projectId);
  tasks.value = await TaskService.getTaskForProject(route.params.projectId, true);
};

const updateSelectedArea = (areaId) => {
  tableSearch.value = areaId;
};

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
  return tasks.value.map(task => ({
    formatted: `[${task.areaGeoJSON.properties.id}] ${task.points}pts - ${task.timeInterval.name} - ${task.type}`,
    solved: task.solved,
    solvedBy: task.solvedBy || '',
    intervalDescription: task.timeInterval?.description || '',
    taskDescription: task.description || '',
    type: task.type,
    timeInterval: task.timeInterval
  }));
});

onMounted(async () => {
  project.value = await ProjectsService.getProjectById(route.params.projectId);
  tasks.value = await TaskService.getTaskForProject(route.params.projectId, true);
  checkins.value = await CheckinService.getByProject(route.params.projectId);
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
  cursor: pointer;
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
