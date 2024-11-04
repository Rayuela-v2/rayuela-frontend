<script setup>
import { onMounted, ref } from "vue";
import BadgesService from "@/services/BadgesService";
import {useRoute, useRouter} from "vue-router";
import { toast } from "vue3-toastify";

const badges = ref([]);
const headers = ref([
  { title: 'Nombre de la insignia', value: 'name', sortable: true },
  { title: 'Acciones', value: 'actions', sortable: false }
]);

const selectedBadge = ref(null);
const dialogDisable = ref(false);

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  badges.value = await BadgesService.getBadges(route.params.projectId);
});

const editBadge = (badge) => {
  router.push(`/admin/project/${route.params.projectId}/gamification/badge/${badge._id}`);
};

const addBadge = () => {
  router.push(`/admin/project/${route.params.projectId}/gamification/badge/new`);
};

const confirmDisable = (badge) => {
  selectedBadge.value = badge;
  dialogDisable.value = true;
};

const disableBadge = async () => {
  selectedBadge.value.available = !selectedBadge.value.available;
  await BadgesService.toggleAvailability(selectedBadge.value._id)
      .then(async () => {
        toast.success('Insignia actualizada :)');
        dialogDisable.value = false;
        badges.value = await BadgesService.getBadges(route.params.projectId);
      });
};
</script>

<template>
  <main>
    <h1>Insignias</h1>
    <div style="display: flex; justify-content: flex-end;">
      <v-btn color="black" @click="addBadge">Agregar Insignia</v-btn>
    </div>
    <v-container>
      <v-data-table
          :headers="headers"
          :items="badges"
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
              <v-list-item @click="confirmDisable(item)">
                <v-list-item-title>{{ item.available ? "Esconder" : "Mostrar" }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDisable" max-width="400px">
        <v-card>
          <v-card-title class="headline">¿Estás seguro?</v-card-title>
          <v-card-text>
            ¿Estás seguro que quieres {{ selectedBadge?.available ? "esconder" : "mostrar" }} la insignia
            <strong>{{ selectedBadge?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisable = false">Cancelar</v-btn>
            <v-btn color="warning" text @click="disableBadge">{{
                selectedBadge?.available ? "Esconder" : "Mostrar"
              }}
            </v-btn>
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
