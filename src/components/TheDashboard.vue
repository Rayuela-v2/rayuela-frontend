<script setup>
import {onMounted, ref} from 'vue';
import ProjectsService from "@/services/ProjectsService";
import {toast} from "vue3-toastify";
import router from "@/router";

const projects_user = ref([]);

// Cargar los proyectos cuando se monta el componente
onMounted(async () => {
  projects_user.value = await ProjectsService.getProjects();
});

function subscribe(project) {
  ProjectsService.toggleSubscription(project._id)
      .then(() => toast.success("Inscripción exitosa"))
      .then(async () => projects_user.value = await ProjectsService.getProjects())
      .catch(() => toast.error('Hubo un error al inscribirse'));
}

const seeProjectDetails = (id) => {
  router.push(`/project/${id}/view`);
}
</script>
<template>
  <div class="container">
    <h2 class="subtitle mb-4">Proyectos</h2>
    <v-container>
      <v-row>
        <v-col
            v-for="(project, index) in projects_user"
            :key="index"
            cols="12"
            sm="6"
            md="4"
        >
          <v-card class="mx-auto cursor-pointer" max-width="400" @click="seeProjectDetails(project._id)">
            <div class="image-container">
              <v-img
                  class="project-image"
                  height="200"
                  :src="project.image || 'https://via.placeholder.com/400'"
                  cover
              />
              <!-- Fondo degradado para mejorar el contraste -->
              <div class="image-overlay">
                <v-card-title class="overlay-title">{{ project.name }}</v-card-title>
              </div>
            </div>

            <v-card-subtitle class="pt-2">
              {{ project.available ? 'Disponible' : 'No disponible' }}
            </v-card-subtitle>

            <v-card-text>
              <div>{{ (project.description?.slice(0,50) || 'Sin descripción disponible') + '...'}}</div>
              <div v-if="project.web">
                <a :href="project.web" target="_blank" class="text-decoration-none">Visitar sitio web</a>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                  :color="project.subscribed ? 'red' : 'green'"
                  text
                  @click="subscribe(project)"
              >
                {{ project.subscribed ? 'Darse de baja' : 'Inscribirse' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style>
.container {
  padding: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: bold;
}

.image-container {
  position: relative;
}

.project-image {
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: flex-end;
  justify-content: start;
  padding: 10px;
}

.overlay-title {
  color: white;
  font-weight: bold;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.6);
}
</style>
