<script setup>
import { onMounted, ref } from 'vue';
import ProjectsService from "@/services/ProjectsService";

const projects_user = ref([]);

// Cargar los proyectos cuando se monta el componente
onMounted(async () => {
  projects_user.value = await ProjectsService.getProjects();
  console.log(projects_user.value);
});

// Definir los encabezados de la tabla
const headers = [
  { text: 'Name', value: 'name' },
  { text: 'Available', value: 'available' },
  { text: 'Web', value: 'web' },
  { text: 'Actions', value: 'actions', sortable: false },
];
</script>

<template>
  <div class="container" style="flex-direction: column">
    <h2 class="subtitle">Proyectos</h2>
    <v-data-table
        :headers="headers"
        :items="projects_user"
        :items-per-page="5"
        class="elevation-1"
    >
      <!-- Columna personalizada para mostrar si está disponible -->
      <template v-slot:item.available="{ item }">
        <v-chip
            :color="!item.subscribed ? 'blue' : 'green'"
            dark
        >
          {{ item.subscribed ? 'Inscripto' : 'Disponible' }}
        </v-chip>
      </template>
      <!-- Columna personalizada para acciones (ejemplo de un botón de ver más) -->
      <template v-slot:item.actions="{ item }">
        <v-btn color="primary" @click="subscribe(item)">Inscribirse</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import ProjectsService from "@/services/ProjectsService";
import {toast} from "vue3-toastify";

function subscribe(project) {
  ProjectsService.subscribe(project._id).then(response => toast.success("Inscripcion exitosa")).catch( err => toast.error('Hubo un error al inscribirse'));
}
</script>

<style>
.container {
  padding: 1rem;
}
</style>
