<script setup>
import { onMounted, ref } from "vue";
import ProjectsService from "@/services/ProjectsService";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const projects = ref([]);
const headers = ref([
  { title: 'Nombre del proyecto', value: 'name', sortable: true},
  { title: 'Acciones', value: 'actions', sortable: false }
]);

const selectedProject = ref(null);
const dialogDisable = ref(false);

const router = useRouter();

onMounted(async () => {
  projects.value = await ProjectsService.getAdminProjects();
});

const editProject = (project) => {
  router.push(`/admin/project/${project._id}`);
};

const confirmDisable = (project) => {
  selectedProject.value = project;
  dialogDisable.value = true;
};

const disableProject = async () => {
  selectedProject.value.available = false;
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
    <v-container>
      <v-data-table
          :headers="headers"
          :items="projects"
          class="elevation-1"
          item-class="getRowClass"
      >
        <template v-slot:item.actions="{ item }">
          <div style="display: flex">
            <v-btn icon variant="text" @click="editProject(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn variant="text" size="xxs" :color="item.available ? 'orange': 'green'" @click="confirmDisable(item)">
              {{item.available ? "Esconder": "Mostrar"}}
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDisable" max-width="400px">
        <v-card>
          <v-card-title class="headline">¿Estás seguro?</v-card-title>
          <v-card-text>
            ¿Estás seguro que quieres {{selectedProject.available ? "esconder": "mostrar"}} el proyecto <strong>{{ selectedProject?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisable = false">Cancelar</v-btn>
            <v-btn color="warning" text @click="disableProject">{{selectedProject.available ? "esconder": "mostrar"}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </main>
</template>
