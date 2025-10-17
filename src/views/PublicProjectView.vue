<template>
  <v-container>
    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="6">
          <v-img :src="project.image" alt="Imagen del proyecto" class="mb-4" contain/>
        </v-col>
        <v-col cols="12" md="6">
          <h2>{{ project.name }}</h2>
          <p class="text-subtitle-1 mb-3" v-html="project.description.replace(/\n/g, '<br>')"></p>
          <v-btn color="green" block large @click="goToLogin">
            <v-icon left size="large">mdi-account-plus</v-icon>
            Inscribirse
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProjectsService from '@/services/ProjectsService';

const route = useRoute();
const router = useRouter();

const project = ref({
  name: '',
  description: '',
  image: '',
  web: ''
});

const goToLogin = () => {
  router.push({ name: 'login' });
};

onMounted(async () => {
  project.value = await ProjectsService.getPublicProjectById(route.params.projectId);
});
</script>
