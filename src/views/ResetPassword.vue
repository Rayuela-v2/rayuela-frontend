<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";

const route = useRoute();
const token = route.query.token || ""; // Extraer el token de la URL
const newPassword = ref("");
const loading = ref(false);

const passwordRule = (value) => {
  return value.length >= 8;
};

async function resetPassword() {
  try {
    if (!passwordRule(newPassword.value)) {
      toast.error("La contraseña debe tener al menos 8 caracteres", { autoClose: 3000 });
      return;
    }

    loading.value = true;
    await AuthService.recoverPassword(token, newPassword.value);
    loading.value = false;
    toast.success("Contraseña restablecida con éxito", { autoClose: 3000 });
  } catch (error) {
    loading.value = false;
    toast.error("Error al restablecer la contraseña", { autoClose: 3000 });
  }
}
</script>

<template>
  <v-container class="container">
    <h1 class="title">Restablecer Contraseña</h1>
    <br />
    <v-form @submit.prevent="resetPassword">
      <v-text-field
        v-model="newPassword"
        label="Nueva Contraseña"
        placeholder="Ingresa tu nueva contraseña"
        outlined
        type="password"
        :loading="loading"
        required
      />
      <v-btn color="success" type="submit" block>Restablecer Contraseña</v-btn>
    </v-form>
  </v-container>
</template>

<style scoped>
.container {
  max-width: 360px;
  margin: auto;
}

.title {
  text-align: center;
}
</style>