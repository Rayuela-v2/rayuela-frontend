<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const showNav = ref(false);
const langs = ['ES', 'EN', 'PT'];
const router = useRouter();
const token = ref(false);
const username = ref('');
const profile_image = ref('');

onMounted(async () => {
  if (localStorage.getItem("token")) {
    token.value = true;
    username.value = localStorage.getItem("username");
    profile_image.value = localStorage.getItem("profile_image");
    router.push({ path: '/dashboard' });
  }
});

function logout() {
  localStorage.clear();
  localStorage.setItem("msg_logout", "1");
  token.value = false;
  router.push({ path: '/' });
}

function getUsernameInitial() {
  return username.value ? username.value.charAt(0).toUpperCase() : '';
}
</script>

<template>
  <nav class="navbar is-spaced is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item">
        <RouterLink to="/"><img src="@/assets/img/rayuela_logo.jpg" width="112" height="28"></RouterLink>
      </a>

      <a role="button" class="navbar-burger" @click="showNav = !showNav" :class="{ 'is-active': showNav }" aria-label="menu" aria-expanded="false">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': showNav }">
      <div class="navbar-start">
        <div class="select is-rounded">
          <select v-model="$i18n.locale">
            <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">
              {{ lang }}
            </option>
          </select>
        </div>
        <RouterLink to="/about"><a class="navbar-item">{{ $t("navBar.about") }}</a></RouterLink>
      </div>

      <div class="navbar-end">
        <div>
          <div v-if="token" class="navbar-container">
            <div class="user-info">
              <span>{{ username }}</span>
              <div class="profile-initial">
                {{ getUsernameInitial() }}
              </div>
            </div>
            <button class="button is-danger" @click="logout()" value="logout">{{ $t("navBar.button_logout") }}</button>
          </div>
          <div v-else>
            <div class="buttons" style="gap: 8px">
              <div class="left">
                <RouterLink to="/login"><button class="button is-success">{{ $t("navBar.button_login") }}</button></RouterLink>
              </div>
              <div class="right">
                <RouterLink to="/register"><button class="button is-link">{{ $t("navBar.button_signup") }}</button></RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  margin-bottom: 20px;
}
.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-pic img {
  border-radius: 50%;
}

.profile-initial {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #00c4cc;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    margin-bottom: 10px;
  }
}
</style>
