<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {toast} from "vue3-toastify";
import AuthService from "@/services/AuthService";

const router = useRouter();
const username = ref("");
const email = ref("");
const password1 = ref("");
const password2 = ref("");
const readAgreement = ref(false);
const showPassword1 = ref(false);
const showPassword2 = ref(false);
const errors = ref({});
const showSuccessScreen = ref(false);

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function is_valid_form() {
  errors.value = {};
  if (!username.value) errors.value.username = 'El nombre de usuario es requerido';
  if (!email.value || !isValidEmail(email.value)) errors.value.email = 'El correo no tiene un formato correcto';
  if (!password1.value) errors.value.password1 = 'La contraseña es requerida';
  if (password1.value !== password2.value) errors.value.password2 = 'Las contraseñas no coinciden';
  if (!readAgreement.value) errors.value.readAgreement = 'Debe aceptar los términos y condiciones';
  return Object.keys(errors.value).length === 0;
}

async function signup() {
  if (is_valid_form()) {
    const user = {
      username: username.value?.trim(),
      email: email.value?.trim(),
      password: password1.value,
      profile_image: "https://example.com/image.jpg",
      complete_name: username.value?.trim(),
    };
    AuthService.register(user)
        .then(() => {
          toast.success('Registro exitoso, por favor revise su casilla de correo para verificarlo antes de iniciar sesión', {autoClose: 3000});
          showSuccessScreen.value = true;
          setTimeout(() =>
              window.location.href = "/login", 3000)
        })
        .catch(err => {
          Object.keys(err?.response?.data).forEach(k => {
            toast.error(err.response.data[k], {autoClose: 3000});
          });
        });
  }
}
</script>

<template>
  <v-container max-width="400px">
    <template v-if="showSuccessScreen">
      <h1 class="text-center mb-4">{{ $t("register.success_title") }}</h1>
      <p class="text-center">{{ $t("register.success_message") }}</p>
      <hr>
      <v-btn block color="primary" @click="router.push('/login')">{{ $t("register.go_home") }}</v-btn>
    </template>
    <template v-else>
      <h1 class="text-center mb-4">{{ $t("register.title") }}</h1>
      <v-form @submit.prevent="signup">
        <v-text-field v-model="username" :label="$t('register.username_field')" :error-messages="errors.username"/>
        <v-text-field v-model="email" :label="$t('register.email_field')" :error-messages="errors.email"/>
        <v-text-field
            v-model="password1"
            :label="$t('register.password1')"
            :type="showPassword1 ? 'text' : 'password'"
            :error-messages="errors.password1"
            :append-inner-icon="showPassword1 ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword1 = !showPassword1"
        />
        <v-text-field
            v-model="password2"
            :label="$t('register.password2')"
            :type="showPassword2 ? 'text' : 'password'"
            :error-messages="errors.password2"
            :append-inner-icon="showPassword2 ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword2 = !showPassword2"
        />
        <v-checkbox v-model="readAgreement" :label="$t('register.checkbox')" :error-messages="errors.readAgreement"/>
        <v-btn block color="primary" type="submit">{{ $t("register.button_signup") }}</v-btn>
        <v-btn block color="secondary" to="/login" variant="text">{{ $t("register.button_login") }}</v-btn>
      </v-form>
    </template>
  </v-container>
</template>
