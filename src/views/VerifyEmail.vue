<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";

const route = useRoute();
const router = useRouter();
const loading = ref(false);

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    toast.error("Token de verificación no encontrado", { autoClose: 3000 });
    router.push("/login");
    return;
  }

  try {
    loading.value = true;
    await AuthService.verifyUser(token);
    loading.value = false;
    toast.success("Correo verificado exitosamente", { autoClose: 3000 });
    setTimeout(() => router.push("/login"), 3000);
  } catch (error) {
    loading.value = false;
    toast.error("Error al verificar el correo", { autoClose: 3000 });
    //setTimeout(() => router.push("/login"), 2000);
  }
});
</script>

<template>
  <v-container class="container">
    <h1 class="title">Verificando tu correo...</h1>
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="progress"
    />
  </v-container>
</template>

<style scoped>
.container {
  max-width: 360px;
  margin: auto;
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 20px;
  margin-bottom: 20px;
}

.progress {
  margin-top: 20px;
}
</style>