<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
      toast.error(t("auth.password_min_length_error"), { autoClose: 3000 });
      return;
    }

    loading.value = true;
    await AuthService.recoverPassword(token, newPassword.value);
    loading.value = false;
    toast.success(t("auth.password_reset_success"), { autoClose: 3000 });
    setTimeout(() => window.location.href = "/login", 3000)
  } catch (error) {
    loading.value = false;
    toast.error(t("auth.password_reset_error"), { autoClose: 3000 });
  }
}
</script>

<template>
  <v-container class="container">
    <h1 class="title">{{ $t("auth.reset_password_title") }}</h1>
    <br />
    <v-form @submit.prevent="resetPassword">
      <v-text-field
        v-model="newPassword"
        :label="$t('auth.new_password_label')"
        :placeholder="$t('auth.new_password_placeholder')"
        outlined
        type="password"
        :loading="loading"
        required
      />
      <v-btn color="success" type="submit" block>{{ $t("auth.reset_password_title") }}</v-btn>
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
