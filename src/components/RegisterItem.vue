<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {toast} from "vue3-toastify";
import AuthService from "@/services/AuthService";
import { useI18n } from 'vue-i18n';
import GoogleAuthButton from "@/components/GoogleAuthButton.vue";

const { t } = useI18n();

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
const pendingGoogleCredential = ref(null);
const showGoogleUsernameDialog = ref(false);
const googleUsernameDraft = ref("");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function is_valid_form() {
  errors.value = {};
  if (!username.value?.trim()) errors.value.username = t('register.error_username_required');
  if (!email.value || !isValidEmail(email.value)) errors.value.email = t('register.error_email_invalid');
  if (!password1.value) errors.value.password1 = t('register.error_password_required');
  if (password1.value !== password2.value) errors.value.password2 = t('register.error_passwords_mismatch');
  if (!readAgreement.value) errors.value.readAgreement = t('register.error_agreement_required');
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
          toast.success(t('register.success_registration'), {autoClose: 3000});
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

async function signupWithGoogle(credential) {
  pendingGoogleCredential.value = credential;
  errors.value = {};
  await finishGoogleSignup({
    credential,
    usernameOverride: undefined,
  });
}

function is_valid_google_signup() {
  errors.value = {};
  if (!googleUsernameDraft.value?.trim()) errors.value.username = t('register.error_username_required');
  if (!readAgreement.value) errors.value.readAgreement = t('register.error_agreement_required');
  return Object.keys(errors.value).length === 0;
}

async function finishGoogleSignup({ credential, usernameOverride }) {
  try {
    const payload = usernameOverride?.trim()
        ? { username: usernameOverride.trim() }
        : {};
    await AuthService.loginWithGoogle(credential, payload);
    await AuthService.getUser();
    showGoogleUsernameDialog.value = false;
    pendingGoogleCredential.value = null;
    toast.success(t('auth.google_success'), {autoClose: 3000});
    await router.push("/dashboard");
    window.location.reload();
  } catch (error) {
    AuthService.clearSession();
    const responseData = error?.response?.data;

    if (responseData?.requiresUsername) {
      googleUsernameDraft.value =
          username.value?.trim() || responseData.suggestedUsername || "";
      showGoogleUsernameDialog.value = true;
      return;
    }

    toast.error(responseData?.message || t('auth.google_error'), {
      autoClose: 3000,
    });
  }
}

async function confirmGoogleUsername() {
  if (!is_valid_google_signup()) {
    toast.error(t('register.google_username_required'), {autoClose: 3000});
    return;
  }

  username.value = googleUsernameDraft.value.trim();
  await finishGoogleSignup({
    credential: pendingGoogleCredential.value,
    usernameOverride: googleUsernameDraft.value,
  });
}

function cancelGoogleUsernameDialog() {
  showGoogleUsernameDialog.value = false;
  pendingGoogleCredential.value = null;
}

function handleGoogleRenderError(error) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return;
  }

  toast.error(error?.message || t('auth.google_error'), {autoClose: 3000});
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
        <v-divider class="my-4" />
        <p class="google-copy">{{ $t("auth.or_continue_with_google") }}</p>
        <GoogleAuthButton
            text="signup_with"
            @success="signupWithGoogle"
            @error="handleGoogleRenderError"
        />
        <v-btn block color="secondary" to="/login" variant="text">{{ $t("register.button_login") }}</v-btn>
      </v-form>
      <v-dialog v-model="showGoogleUsernameDialog" max-width="420">
        <v-card>
          <v-card-title>{{ $t("register.google_username_title") }}</v-card-title>
          <v-card-text>
            <p class="google-dialog-copy">
              {{ $t("register.google_username_description") }}
            </p>
            <v-text-field
                v-model="googleUsernameDraft"
                :label="$t('register.username_field')"
                :error-messages="errors.username"
                autofocus
            />
            <v-checkbox
                v-model="readAgreement"
                :label="$t('register.checkbox')"
                :error-messages="errors.readAgreement"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="cancelGoogleUsernameDialog">
              {{ $t("common.cancel") }}
            </v-btn>
            <v-btn color="primary" @click="confirmGoogleUsername">
              {{ $t("register.google_username_confirm") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<style scoped>
.google-copy {
  margin-bottom: 16px;
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
}

.google-dialog-copy {
  margin-bottom: 16px;
}
</style>
