<script setup>
import {useRouter} from 'vue-router';
import {ref, onMounted} from 'vue'
import {toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import ProjectCard from "@/components/ProjectCard.vue";
import ViewMoreButton from "@/components/ViewMoreButton.vue";
import ProjectsService from "@/services/ProjectsService";

const router = useRouter()
const projects = ref([])
const errors = []

onMounted(async () => {
  try {
    const response = await ProjectsService.getPublicrojects()
    projects.value = response.slice(0, 4)
  } catch (e) {
    errors.push(e)
  }

})

</script>

<template>
  <div class="projects-section" id="projects-section">
    <h2 class="subtitle">{{ $t('projects.selector_title') }}</h2>
    <hr class="separator"/>
    <v-row>
      <v-col
          v-for="project in projects"
          :key="project._id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
      >
        <v-card
          class="mx-auto"
          max-width="344"
          @click="router.push('/public/project/' + project._id + '/view')"
          style="cursor: pointer;"
        >
          <v-img
            :src="project.image"
            height="180"
            cover
            :alt="$t('project.image_alt')"
          ></v-img>
          <v-card-title>{{ project.name }}</v-card-title>
          <v-card-text>
            <p>{{ project.description.slice(0,120) }}...</p>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span v-if="project.available" style="color: #27ae60; font-weight: 600;">{{ $t('project.status_available') }}</span>
              <span v-else style="color: #c0392b; font-weight: 600;">{{ $t('project.status_unavailable') }}</span>
              <span v-if="project.subscribed"
                    style="background: #2980b9; color: #fff; border-radius: 0.5rem; padding: 0.2rem 0.7rem; font-size: 0.9rem;">{{ $t('project.status_subscribed') }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.projects-section {
  padding: 2rem 0;
}

.separator {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
  margin: 1rem 0 3rem;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
  padding: 2rem 0;
  background: #f8f9fa;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
}

.subtitle {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #2c3e50;
  letter-spacing: 1px;
}

</style>
