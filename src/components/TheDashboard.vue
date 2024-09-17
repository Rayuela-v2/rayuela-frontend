<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router';
import {toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import ProjectCard from "@/components/ProjectCard.vue";
import ViewMoreButton from "@/components/ViewMoreButton.vue";
import AuthService from "@/services/AuthService";
import ProjectsService from "@/services/ProjectsService";

const router = useRouter()
const complete_name = ref("")
const profile_image = ref("")
const projects_user = ref([])
// TODO: pasar mensajes a locale
onMounted(async () => {
  if (!localStorage.getItem("token")) {
    router.push({path: '/login'})
  }

  if (localStorage.getItem("msg_login") === "1") {
    toast.success("Sesión iniciada correctamente", {autoClose: 3000});
    localStorage.removeItem("msg_login")
  }
  if (localStorage.getItem("token")) {
    user_data()
  }
  const projects = await ProjectsService.getProjects();
  projects_user.value = projects.slice(0, 3);
})

async function user_data() {
  AuthService.getUser()
      .then(response => {
        localStorage.setItem("complete_name", response.complete_name)
        localStorage.setItem("profile_image", response.profile_image)
        complete_name.value = localStorage.getItem("complete_name")
        profile_image.value = localStorage.getItem("profile_image")
      })
      .catch(error => {
        console.log("AXIOS CATCH: " + error)
      })
}

</script>

<template>
  <div class="container" style="flex-direction: column">
    <h2 class="subtitle">Mis proyectos</h2>
    <div class="container">
      <div v-for="project in projects_user" :key="project.id">
        <ProjectCard :project="project"/>
      </div>
      <ViewMoreButton/>
    </div>

  </div>

</template>

<style>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
}

.card image {
  max-width: 100%;
}

</style>
