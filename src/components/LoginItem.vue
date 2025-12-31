<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const username = ref("");
const password = ref("");
const showPassword = ref(false);

onMounted(() => {
  if (localStorage.getItem("token")) {
    router.push({ path: '/dashboard' });
  }
});

async function login() {
  const user = { username: username.value, password: password.value };
  AuthService.loginWithPw(user)
      .then(() => {
        AuthService.getUser()
            .then(() => {
              router.push("/dashboard");
              location.reload();
            })
            .catch(error => {
              console.log(error);
            });
      })
      .catch(() => {
        toast.error(t("login.error_credentials"), { autoClose: 3000 });
      });
}
</script>

<template>
  <v-container class="container">
    <v-card class="login-card" elevation="2">
      <v-card-title class="title">
        {{ $t("login.title") }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field
              v-model="username"
              :label="$t('login.username_field')"
              :placeholder="$t('login.username_placeholder')"
              outlined
              dense
              clearable
              required
          />
          <v-text-field
              v-model="password"
              :label="$t('login.password')"
              :placeholder="$t('login.password_placeholder')"
              :type="showPassword ? 'text' : 'password'"
              outlined
              dense
              clearable
              required
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
          />
          <v-btn
              color="success"
              type="submit"
              block
              class="login-button"
          >
            {{ $t("login.button_login") }}
          </v-btn>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="actions">
        <RouterLink to="/forgot-password" class="forgot-password-link">
          {{ $t("login.forgot_password") }}
        </RouterLink>
        <RouterLink to="/register">
          <v-btn color="primary" outlined>
            {{ $t("login.button_signup") }}
          </v-btn>
        </RouterLink>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}

.login-card {
  padding: 20px;
  border-radius: 8px;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.login-button {
  margin-top: 20px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.forgot-password-link {
  font-size: 14px;
  text-decoration: none;
}
</style>
