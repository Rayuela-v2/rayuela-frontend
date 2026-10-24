<template>
  <v-breadcrumbs density="compact" :items="breadcrumbItems">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const props = defineProps({
  items: {
    type: String,
    required: true,
  },
});

const breadcrumbItems = computed(() => {
  const admin = {
    title: t('admin.breadcrumb_admin'),
    href: '/admin',
  };

  const gamification = {
    title: t('admin.edit_gamification'),
    href: `/admin/project/${route.params.projectId}/gamification`,
  };

  const pointRule = {
    title: t('admin.score_rules'),
  };

  const badgeRule = {
    title: t('admin.badges'),
  };

  const projectDetails = {
    title: t('admin.project_detail'),
    href: `/admin/project/${route.params.projectId}/data`,
  };

  const taskManager = {
    title: t('admin.task_management'),
    href: `/admin/project/${route.params.projectId}/data`,
  };

  const projectCheckins = {
    title: t('admin.checkins_title'),
  };

  const analyticsDashboard = {
    title: t('admin.analytics_dashboard'),
  };

  const rules = {
    pointRulesPaths: [admin, gamification, pointRule],
    badgePath: [admin, gamification, badgeRule],
    gamificationPath: [admin, gamification],
    fadingPath: [admin, gamification, { title: t('admin.fading_breadcrumb') }],
    projectDetailsPath: [admin, projectDetails],
    taskManagerPath: [admin, projectDetails, taskManager],
    checkinsPath: [admin, projectCheckins],
    analyticsPath: [admin, analyticsDashboard],
  };

  const list = (rules[props.items] || []).map((item) => ({ ...item }));
  if (list.length > 0) {
    list[list.length - 1].disabled = true;
  }
  return list;
});
</script>
