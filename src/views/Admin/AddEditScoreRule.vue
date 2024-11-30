<template>
  <v-container>
    <h1 class="mb-6">{{ isNew ? 'Crear Regla de Puntaje' : 'Editar Regla de Puntaje' }}</h1>

    <v-form @submit.prevent="saveScoreRule">
      <!-- Información de la Regla de Puntaje -->
      <v-card class="pa-4 mb-6">
        <h2>Información de la Regla</h2>
        <v-text-field label="Puntaje" v-model.number="scoreRule.score" type="number" min="1" required />

        <v-select
            label="Tipo de Tarea"
            v-model="scoreRule.taskType"
            :items="taskTypeOptions"
            required
        />

        <v-select
            label="Área"
            v-model="scoreRule.areaId"
            :items="areaOptions"
            required
        />

        <v-select
            label="Intervalo de Tiempo"
            v-model="scoreRule.timeIntervalId"
            :items="intervalOptions"
            required
        />

        <v-checkbox
            label="Debe Contribuir"
            v-model="scoreRule.mustContribute"
        />
      </v-card>

      <!-- Botón de guardar -->
      <v-btn type="submit" variant="elevated" color="primary" width="100%">
        {{ isNew ? 'Crear Regla' : 'Actualizar Regla' }}
      </v-btn>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import ProjectsService from "@/services/ProjectsService";
import GamificationService from "@/services/GamificationService";
import {useRoute, useRouter} from "vue-router";
import {store} from "@/vuex/state";

const route = useRoute();
const router = useRouter();
const isNew = ref(false);

const defaultScoreRule = {
  projectId: route.params.projectId,
  score: 0,
  taskType: 'Cualquiera',
  areaId: 'Cualquiera',
  timeIntervalId: 'Cualquiera',
  mustContribute: false,
};

const scoreRule = ref({ ...defaultScoreRule });

const taskTypeOptions = ref([]);
const areaOptions = ref([]);
const intervalOptions = ref([]);

const saveScoreRule = async () => {
  try {
    if (isNew.value) {
      await GamificationService.createScoreRule(scoreRule.value);
      toast.success('Regla creada exitosamente');
    } else {
      await GamificationService.updateScoreRule(scoreRule.value);
      toast.success('Regla actualizada exitosamente');
    }
    router.push(`/admin/project/${route.params.projectId}/gamification`);
  } catch (error) {
    console.error("Error al guardar la regla de puntaje:", error);
    toast.error('Error al guardar la regla de puntaje');
  }
};

onMounted(async () => {
  const project = store.state.project;
  const ruleId = route.params.id;
  taskTypeOptions.value = project.taskTypes.concat(["Cualquiera"]);
  areaOptions.value = project.areas.features.map(feature => feature.properties.id).concat(["Cualquiera"]);
  intervalOptions.value = project.timeIntervals.map(ti => ti.name).concat(["Cualquiera"]);

  if (ruleId === 'new') {
    isNew.value = true;
    scoreRule.value = {...defaultScoreRule};
  } else {
    isNew.value = false;
    try {
      const stateRule = store.state.currentScoreRule;
      scoreRule.value = {...defaultScoreRule, ...stateRule};
    } catch (error) {
      console.error("Error al cargar la regla de puntaje:", error);
      toast.error('Error al cargar la regla de puntaje');
    }
  }
});
</script>
