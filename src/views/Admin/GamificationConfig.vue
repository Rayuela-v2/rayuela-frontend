<script setup>
import {onMounted, ref} from "vue";
import BadgesService from "@/services/GamificationService";
import {useRoute, useRouter} from "vue-router";
import {toast} from "vue3-toastify";
import {store} from "@/vuex/state";
import GamificationService from "@/services/GamificationService";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";

const badges = ref([]);
const scoreRules = ref([]);

const badgeHeaders = ref([
  {title: 'Nombre de la insignia', value: 'name', sortable: true},
  {title: 'Acciones', value: 'actions', sortable: false}
]);

const scoreRuleHeaders = ref([
  {title: 'Nombre de la regla', value: 'label', sortable: true},
  {title: 'Acciones', value: 'actions', sortable: false}
]);

const selectedBadge = ref(null);
const selectedScoreRule = ref(null);
const dialogDisableBadge = ref(false);
const dialogDisableScoreRule = ref(false);

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  store.commit('setCurrentBadge', null)
  store.commit('setScoreRule', null)
  const gamification = await BadgesService.getGamification(route.params.projectId);
  store.commit('setCurrentGamification', gamification)
  badges.value = gamification.badgesRules;
  scoreRules.value = gamification.pointRules;
});

const editBadge = (badge) => {
  store.commit("setCurrentBadge", badge)
  router.push(`/admin/project/${route.params.projectId}/gamification/badge/${badge._id}`);
};

const addBadge = () => {
  router.push(`/admin/project/${route.params.projectId}/gamification/badge/new`);
};

const confirmDeleteBadge = (badge) => {
  selectedBadge.value = badge;
  dialogDisableBadge.value = true;
};

const deleteBadge = async () => {
  selectedBadge.value.available = !selectedBadge.value.available;
  await GamificationService.deleteBadge(selectedBadge.value._id)
      .then((res) => {
        toast.success('Insignia eliminada :)');
        dialogDisableBadge.value = false;
        badges.value = res.badges;
      });
};

const editScoreRule = (scoreRule) => {
  store.commit("setScoreRule", scoreRule)
  router.push(`/admin/project/${route.params.projectId}/gamification/score-rule/${scoreRule._id}`);
};

const addScoreRule = () => {
  router.push(`/admin/project/${route.params.projectId}/gamification/score-rule/new`);
};

const confirmDisableScoreRule = (scoreRule) => {
  selectedScoreRule.value = scoreRule;
  dialogDisableScoreRule.value = true;
};

const deleteScoreRule = async () => {
  await GamificationService.deleteScoreRule(selectedScoreRule.value._id)
      .then((res) => {
        toast.success('Regla de puntaje eliminada :)');
        dialogDisableScoreRule.value = false;
        scoreRules.value = res.pointRules;
      });
};
</script>

<template>
  <main>
    <!-- Sección de Insignias -->
    <BreadCrumb items="gamificationPath" />
    <h1>Insignias</h1>
    <div style="display: flex; justify-content: flex-end;">
      <v-btn color="black" @click="addBadge">Agregar Insignia</v-btn>
    </div>
    <v-container>
      <v-data-table
          :headers="badgeHeaders"
          :items="badges"
          :no-data-text="'Aún no hay datos para mostrar.'"
          class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn variant="flat" v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editBadge(item)">
                <v-list-item-title>Editar insignia</v-list-item-title>
              </v-list-item>
              <v-list-item @click="confirmDeleteBadge(item)">
                <v-list-item-title>Eliminar</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDisableBadge" max-width="400px">
        <v-card>
          <v-card-title class="headline">¿Estás seguro?</v-card-title>
          <v-card-text>
            ¿Estás seguro que quieres eliminar la insignia
            <strong>{{ selectedBadge?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisableBadge = false">Cancelar</v-btn>
            <v-btn color="warning" text @click="deleteBadge">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <!-- Sección de Reglas de Puntaje -->
    <h1>Reglas de Puntaje</h1>
    <div style="display: flex; justify-content: flex-end;">
      <v-btn color="black" @click="addScoreRule">Agregar Regla de Puntaje</v-btn>
    </div>
    <v-container>
      <v-data-table
          :headers="scoreRuleHeaders"
          :items="scoreRules"
          :no-data-text="'Aún no hay datos para mostrar.'"
          class="elevation-1"
      >
        <template v-slot:item.label="{ item }">
          {{ `[${item.score}pts] Area ${item.areaId}, Intervalo ${item.timeIntervalId}, Tipo ${item.taskType}` }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn variant="flat" v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editScoreRule(item)">
                <v-list-item-title>Editar regla de puntaje</v-list-item-title>
              </v-list-item>
              <v-list-item @click="confirmDisableScoreRule(item)">
                <v-list-item-title>Eliminar</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDisableScoreRule" max-width="400px">
        <v-card>
          <v-card-title class="headline">¿Estás seguro?</v-card-title>
          <v-card-text>
            ¿Estás seguro que quieres eliminar la regla de puntaje
            <strong>{{ selectedScoreRule?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisableScoreRule = false">Cancelar</v-btn>
            <v-btn color="warning" text @click="deleteScoreRule">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </main>
</template>

<style scoped>
.component-container {
  display: inline-block;
}
</style>
