<script setup>
import {onMounted, ref} from "vue";
import ProjectsService from "@/services/ProjectsService";
import {useRouter} from "vue-router";
import {toast} from "vue3-toastify";

const projects = ref([]);
const headers = ref([
  {title: 'Nombre del proyecto', value: 'name'},
  {title: 'Web', value: 'web'},
  {title: 'Acciones', value: 'actions', sortable: false}
]);

const selectedProject = ref(null);
const dialogDelete = ref(false);

const router = useRouter();

onMounted(async () => {
  projects.value = await ProjectsService.getProjects();
});

const editProject = (project) => {
  router.push(`/admin/project/${project._id}`);
};

const confirmDelete = (project) => {
  selectedProject.value = project;
  dialogDelete.value = true;
};

const deleteProject = async () => {
  console.log('Eliminando', selectedProject.value.name);
  ProjectsService.delete(selectedProject.value._id)
      .then(async () => {
        toast.success('Proyecto eliminado :)');
        dialogDelete.value = false;
        projects.value = await ProjectsService.getProjects();
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
      >
        <template v-slot:item.actions="{ item }">
          <div style="display: flex">
            <v-btn icon variant="text" @click="editProject(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="confirmDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDelete" max-width="400px">
        <v-card>
          <v-card-title class="headline">¿Estás seguro?</v-card-title>
          <v-card-text>
            ¿Estás seguro que quieres eliminar el proyecto <strong>{{ selectedProject?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDelete = false">Cancelar</v-btn>
            <v-btn color="error" text @click="deleteProject">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </main>
</template>
