<template>
  <v-container>
    <h1 class="mb-6">{{ isNew ? 'Crear Insignia' : 'Editar Insignia' }}</h1>

    <v-form @submit.prevent="saveBadge">
      <!-- Información de la Insignia -->
      <v-card class="pa-4 mb-6">
        <h2>Información de la Insignia</h2>
        <v-text-field label="Nombre de la Insignia" v-model="badge.name" required />
        <v-textarea label="Descripción de la Insignia" v-model="badge.description" required />
        <v-text-field label="URL de la imagen" v-model="badge.imageUrl" />
        <v-text-field label="Cantidad de Check-ins" v-model.number="badge.checkinsAmount" type="number" min="1" required />

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

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BadgesService from '@/services/BadgesService';
import { toast } from 'vue3-toastify';
import ProjectsService from "@/services/ProjectsService";

const route = useRoute();
const router = useRouter();
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
  timeIntervalId: 'Cualquiera'
};

const badge = ref({ ...defaultBadge });

const badgeOptions = ref([]);
const taskTypeOptions = ref([]);
const areaOptions = ref([]);
const intervalOptions = ref([]);

const saveBadge = async () => {
  try {
    if (isNew.value) {
      await BadgesService.createBadge(badge.value);
      toast.success('Insignia creada exitosamente');
    } else {
      await BadgesService.updateBadge(badge.value);
      toast.success('Insignia actualizada exitosamente');
    }
    router.push(`/admin/project/${route.params.projectId}/gamification`);
  } catch (error) {
    console.error("Error al guardar la insignia:", error);
    toast.error('Error al guardar la insignia');
  }
};

onMounted(async () => {
  const badgeId = route.params.id;
  if (badgeId === 'new') {
    isNew.value = true;
    badge.value = { ...defaultBadge };
  } else {
    isNew.value = false;
    try {
      const project = await ProjectsService.getProjectById(route.params.projectId)
      const loadedBadge = await BadgesService.getBadgeById(badgeId);
      badge.value = { ...defaultBadge, ...loadedBadge };
      taskTypeOptions.value = project.taskTypes.concat(["Cualquiera"]);
      areaOptions.value = project.areas.features.map(feature => feature.properties.id).concat(["Cualquiera"]);
      intervalOptions.value = project.timeIntervals.map(ti => ti.name).concat(["Cualquiera"]);
      badgeOptions.value = project.possibleBadges.filter(b => b._id !== loadedBadge._id).map(b => b.name)
    } catch (error) {
      console.error("Error al cargar la insignia:", error);
      toast.error('Error al cargar la insignia');
    }
  }
});
</script>
