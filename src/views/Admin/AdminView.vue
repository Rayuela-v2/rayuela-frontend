<script setup>
import {onMounted, ref} from "vue";
import ProjectsService from "@/services/ProjectsService";
import {useRouter} from "vue-router";
import {toast} from "vue3-toastify";
import {store} from "@/vuex/state";

const projects = ref([]);
const headers = ref([
  {title: 'Nombre del proyecto', value: 'name', sortable: true},
  {title: 'Acciones', value: 'actions', sortable: false}
]);

const selectedProject = ref(null);
const dialogDisable = ref(false);

const router = useRouter();

onMounted(async () => {
  store.commit('setProject', null)
  store.commit('setCurrentGamification', null)
  projects.value = await ProjectsService.getAdminProjects();
});

const editProject = (project) => {
  router.push(`/admin/project/${project._id}/data`);
};

const editGamification = (project) => {
  store.commit("setProject", project)
  router.push(`/admin/project/${project._id}/gamification`);
};

const addProject = async () => {
  const newP = await ProjectsService.createProject({
    name: "Nuevo proyecto",
    description: "Descripcion del proyecto",
    image: "https://example.com/image.jpg",
    web: "https://example.com",
    available: true,
    areas: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {id: 1},
          geometry: {
            coordinates: [
              [
                [
                  -69.72427193222924,
                  -36.6544904309133
                ],
                [
                  -69.72437839185329,
                  -36.6544904309133
                ],
                [
                  -69.72437839185329,
                  -36.65452925237721
                ],
                [
                  -69.72427193222924,
                  -36.65452925237721
                ],
                [
                  -69.72427193222924,
                  -36.6544904309133
                ]
              ]
            ],
            type: "Polygon"
          }
        }
      ]
    },
    ownerId: localStorage.getItem("user_id")
  });
  router.push(`/admin/project/${newP._id}/data`);
};

const confirmDisable = (project) => {
  selectedProject.value = project;
  dialogDisable.value = true;
};

const disableProject = async () => {
  selectedProject.value.available = !selectedProject.value.available;
  await ProjectsService.toggleAvailability(selectedProject.value._id)
      .then(async () => {
        toast.success('Proyecto actualizado :)');
        dialogDisable.value = false;
        projects.value = await ProjectsService.getAdminProjects();
      });
};
</script>

<template>
  <main>
    <h1>Mis proyectos</h1>
    <div style="display: flex; justify-content: flex-end;">
      <v-btn color="black" @click="addProject">Agregar proyecto</v-btn>
    </div>
    <v-container>
      <v-data-table
          :headers="headers"
          :no-data-text="'Aún no hay datos para mostrar.'"
          :items="projects"
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
              <v-list-item @click="editProject(item)">
                <v-list-item-title>Editar datos</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editGamification(item)">
                <v-list-item-title>Editar ludificación</v-list-item-title>
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
            ¿Estás seguro que quieres {{ selectedProject?.available ? "esconder" : "mostrar" }} el proyecto
            <strong>{{ selectedProject?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisable = false">Cancelar</v-btn>
            <v-btn color="warning" text @click="disableProject">{{
                selectedProject?.available ? "Esconder" : "Mostrar"
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
