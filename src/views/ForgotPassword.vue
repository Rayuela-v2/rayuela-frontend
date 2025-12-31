<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
      toast.success(t("auth.reset_link_sent"), { autoClose: 3000 });
    }
    else {
      toast.error(t("register.error_email_invalid"), { autoClose: 3000 });
    }
  } catch (error) {
    loading.value = false;
    toast.error(t("auth.reset_link_error"), { autoClose: 3000 });
  }
}
</script>

<template>
  <v-container class="container">
    <h1 class="title">{{ $t("auth.reset_password_title") }}</h1>
    <br />
    <v-form @submit.prevent="sendResetLink">
      <v-text-field
          v-model="email"
          :label="$t('register.email_field')"
          :placeholder="$t('auth.email_placeholder')"
          outlined
          type="email"
          :loading="loading"
          required
      />
      <v-btn color="success" type="submit" block>{{ $t("auth.send_link") }}</v-btn>
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