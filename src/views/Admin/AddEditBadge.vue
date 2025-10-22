<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useStore} from 'vuex';
import {toast} from 'vue3-toastify';
import GamificationService from "@/services/GamificationService";
import router from "@/router";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";

const store = useStore();
const route = useRoute();

const isNew = ref(false);

const defaultBadge = {
  projectId: route.params.projectId,
  name: '',
  description: '',
  imageUrl: '',
  checkinsAmount: 1,
  previousBadges: [],
  taskType: 'Cualquiera',
  areaId: 'Cualquiera',
  timeIntervalId: 'Cualquiera',
  mustContribute: false,
};

const badge = ref({...defaultBadge});

const taskTypeOptions = computed(() => store.getters.project?.taskTypes.concat(['Cualquiera']) || []);
const areaOptions = computed(() =>
    store.getters.project?.areas.features.map((feature) => feature.properties.id).concat(['Cualquiera']) || []
);
const intervalOptions = computed(() =>
    store.getters.project?.timeIntervals.map((ti) => ti.name).concat(['Cualquiera']) || []
);
const badgeOptions = computed(() =>
    store.state.currentGamification.badgesRules
        .filter((b) => b._id !== badge.value._id)
        .map((b) => b.name)
);

const validateBadge = () => {
  const requiredFields = [
    'name',
    'description',
    'imageUrl',
    'checkinsAmount',
    'taskType',
    'areaId',
    'timeIntervalId',
  ];

  for (const field of requiredFields) {
    if (!badge.value[field]) {
      toast.error(`El campo "${field}" es obligatorio`);
      return false;
    }
  }
  console.log(isNew.value)

  if (isNew.value && store.state.currentGamification.badgesRules.find(b => b.name === badge.value.name)) {
    toast.error('Ya existe otra insignia con ese nombre');
    return false
  }
  return true;
};

const saveBadge = async () => {
  if (!validateBadge()) return;

  try {
    if (isNew.value) {
      await GamificationService.createBadge(badge.value, route.params.projectId);
    } else {
      await GamificationService.update(badge.value, route.params.projectId);
    }
    toast.success(isNew.value ? 'Insignia creada exitosamente' : 'Insignia actualizada exitosamente');
    await router.push(`/admin/project/${route.params.projectId}/gamification`);
  } catch (error) {
    console.error('Error al guardar la insignia:', error);
    toast.error('Error al guardar la insignia');
  }
};

// Cargar datos al montar
onMounted(() => {
  const badgeId = route.params.id;
  if (badgeId === 'new') {
    isNew.value = true;
    badge.value = {...defaultBadge};
  } else {
    isNew.value = false;
    const stateBadge = store.getters.currentBadge;
    if (stateBadge) {
      badge.value = {...defaultBadge, ...stateBadge};
    } else {
      router.push('/admin/');
    }
  }
});
</script>

<template>
  <v-container>
    <BreadCrumb items="badgePath"/>
    <h1 class="mb-6">{{ isNew ? 'Crear Insignia' : 'Editar Insignia' }}</h1>

    <v-form @submit.prevent="saveBadge">
      <!-- Información de la Insignia -->
      <v-card class="pa-4 mb-6">
        <h2>Información de la Insignia</h2>
        <v-text-field label="Nombre de la Insignia" v-model="badge.name" :disabled="!isNew" required/>
        <v-textarea label="Descripción de la Insignia" v-model="badge.description" required/>
        <v-text-field label="URL de la imagen" v-model="badge.imageUrl" required/>
        <v-row class="my-3" v-if="badge.imageUrl">
          <v-col cols="12" sm="6" md="4">
            <v-img :src="badge.imageUrl" alt="Previsualización de la imagen" contain max-height="200">
              <template #error>
                <v-alert density="compact" variant="tonal" color="error" class="ma-0">
                  No se pudo cargar la imagen. Verifique la URL.
                </v-alert>
              </template>
            </v-img>
          </v-col>
        </v-row>
        <v-text-field
            label="Cantidad de Check-ins"
            v-model.number="badge.checkinsAmount"
            type="number"
            min="1"
            required
        />
        <v-checkbox
            label="El checkin debe ser contribución"
            v-model="badge.mustContribute"
        />

        <v-select
            label="Insignias Anteriores"
            v-model="badge.previousBadges"
            :items="badgeOptions"
            multiple
            chips
        />
        <v-select
            label="Tipo de Tarea"
            v-model="badge.taskType"
            :items="taskTypeOptions"
            required
        />
        <v-select
            label="Área"
            v-model="badge.areaId"
            :items="areaOptions"
            required
        />
        <v-select
            label="Intervalo de Tiempo"
            v-model="badge.timeIntervalId"
            :items="intervalOptions"
            required
        />
      </v-card>

      <!-- Botón de guardar -->
      <v-btn type="submit" variant="elevated" color="primary" width="100%">
        {{ isNew ? 'Crear Insignia' : 'Actualizar Insignia' }}
      </v-btn>
    </v-form>
  </v-container>
</template>
