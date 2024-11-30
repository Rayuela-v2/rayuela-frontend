<template>
  <v-breadcrumbs density="compact" :items="rules[props.items]">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const admin = {
  title: 'Administracion',
  href: '/admin',
};

const gamification = {
  title: 'Ludificacion',
  disabled: false,
  href: `/admin/project/${route.params.projectId}/gamification`,
};

const pointRule = {
  title: 'Regla de puntaje',
  disabled: true,
};

const badgeRule = {
  title: 'Insignia',
  disabled: true,
};

const projectDetails = {
  title: 'Datos del proyecto',
  disabled: true,
};

const pointRulesPaths = [
  admin,gamification,pointRule
];

const badgePath = [
    admin, gamification, badgeRule
];

const gamificationPath = [
    admin, gamification
];

const projectDetailsPath = [
    admin, projectDetails,
];

const rules = {
  pointRulesPaths, badgePath, gamificationPath, projectDetailsPath
}

const props = defineProps({
  items: {
    type: String,
    required: true,
  },
});
</script>