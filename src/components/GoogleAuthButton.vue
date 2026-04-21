<script setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  getGoogleLocale,
  getGoogleClientId,
  isGoogleAuthConfigured,
  loadGoogleIdentityScript,
} from "@/utils/googleAuth";

const props = defineProps({
  text: {
    type: String,
    default: "continue_with",
  },
});

const emit = defineEmits(["success", "error"]);

const mountPoint = ref(null);
const unavailable = ref(false);
const { locale, t } = useI18n();

async function renderButton() {
  if (!mountPoint.value) {
    return;
  }

  if (!isGoogleAuthConfigured()) {
    unavailable.value = true;
    mountPoint.value.innerHTML = "";
    return;
  }

  try {
    const googleLocale = getGoogleLocale(locale.value);
    await loadGoogleIdentityScript(locale.value);
    const googleIdentity = window.google?.accounts?.id;

    if (!googleIdentity) {
      throw new Error(t("auth.google_error"));
    }

    mountPoint.value.innerHTML = "";
    googleIdentity.initialize({
      client_id: getGoogleClientId(),
      callback: ({ credential }) => {
        if (!credential) {
          emit("error", new Error(t("auth.google_error")));
          return;
        }

        emit("success", credential);
      },
    });
    googleIdentity.renderButton(mountPoint.value, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: props.text,
      locale: googleLocale,
      width: 320,
    });
    unavailable.value = false;
  } catch (error) {
    unavailable.value = true;
    emit("error", error);
  }
}

onMounted(renderButton);
watch(() => props.text, renderButton);
watch(locale, renderButton);
</script>

<template>
  <div class="google-auth-button">
    <div ref="mountPoint" class="google-auth-button__mount" />
    <p v-if="unavailable" class="google-auth-button__fallback">
      {{ $t("auth.google_unavailable") }}
    </p>
  </div>
</template>

<style scoped>
.google-auth-button {
  width: 100%;
}

.google-auth-button__mount {
  display: flex;
  justify-content: center;
  min-height: 44px;
}

.google-auth-button__fallback {
  margin-top: 8px;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
