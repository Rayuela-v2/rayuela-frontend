<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from "@/services/AuthService";

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
        toast.error("Credenciales de acceso incorrectas", { autoClose: 3000 });
      });
}
</script>

<template>
  <v-container class="container">
    <h1 class="title">{{ $t("login.title") }}</h1>
    <br />
    <v-form @submit.prevent="login">
      <v-text-field
          v-model="username"
          :label="$t('login.username_field')"
          :placeholder="$t('login.username_placeholder')"
          outlined
      />

      <v-text-field
          v-model="password"
          :label="$t('login.password')"
          :placeholder="$t('login.password_placeholder')"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
      />

      <v-row class="buttons">
        <v-col cols="6">
          <v-btn color="success" type="submit">{{ $t("login.button_login") }}</v-btn>
        </v-col>
        <v-col cols="6">
          <RouterLink to="/register">
            <v-btn color="primary" outlined>{{ $t("login.button_signup") }}</v-btn>
          </RouterLink>
        </v-col>
      </v-row>
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

.buttons {
  display: flex;
  justify-content: space-between;
}
</style>
