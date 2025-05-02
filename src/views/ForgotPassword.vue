<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";

const email = ref("");
const loading = ref(false);
const emailRule = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

async function sendResetLink() {
  try {
    if( emailRule(email.value) ) {
      loading.value = true;
      await AuthService.sendResetPasswordEmail(email.value);
      loading.value = false;
      toast.success("Se ha enviado un enlace de restablecimiento a tu correo", { autoClose: 3000 });
    }
    else {
      toast.error("El correo no tiene un formato correcto", { autoClose: 3000 });
    }
  } catch (error) {
    loading.value = false;
    toast.error("Error al enviar el enlace de restablecimiento", { autoClose: 3000 });
  }
}
</script>

<template>
  <v-container class="container">
    <h1 class="title">Restablecer Contraseña</h1>
    <br />
    <v-form @submit.prevent="sendResetLink">
      <v-text-field
          v-model="email"
          label="Correo Electrónico"
          placeholder="Ingresa tu correo"
          outlined
          type="email"
          :loading="loading"
          required
      />
      <v-btn color="success" type="submit" block>Enviar Enlace</v-btn>
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