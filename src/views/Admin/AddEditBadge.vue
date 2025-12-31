<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {useStore} from 'vuex';
import {toast} from 'vue3-toastify';
import GamificationService from "@/services/GamificationService";
import router from "@/router";
import BreadCrumb from "@/components/utils/BreadCrumb.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const store = useStore();
const route = useRoute();

const isNew = ref(false);

const defaultBadge = {
  projectId: route.params.projectId,
  name: '',
  description: '',
  imageUrl: '',
  checkinsAmount: 1,
  previousBadges: [],
  taskType: t('common.any'),
  areaId: t('common.any'),
  timeIntervalId: t('common.any'),
  mustContribute: false,
};

const badge = ref({...defaultBadge});

const taskTypeOptions = computed(() => store.getters.project?.taskTypes.concat([t('common.any')]) || []);
const areaOptions = computed(() =>
    store.getters.project?.areas.features.map((feature) => feature.properties.id).concat([t('common.any')]) || []
);
const intervalOptions = computed(() =>
    store.getters.project?.timeIntervals.map((ti) => ti.name).concat([t('common.any')]) || []
);
const badgeOptions = computed(() =>
    store.state.currentGamification.badgesRules
        .filter((b) => b._id !== badge.value._id)
        .map((b) => b.name)
);

const validateBadge = () => {
  const requiredFields = [
    'name',
    'description',
    'imageUrl',
    'checkinsAmount',
    'taskType',
    'areaId',
    'timeIntervalId',
  ];

  for (const field of requiredFields) {
    if (!badge.value[field]) {
      toast.error(t('common.field_required', { field: field }));
      return false;
    }
  }
  console.log(isNew.value)

  if (isNew.value && store.state.currentGamification.badgesRules.find(b => b.name === badge.value.name)) {
    toast.error(t('admin.badge_name_exists'));
    return false
  }
  return true;
};

const saveBadge = async () => {
  if (!validateBadge()) return;

  try {
    if (isNew.value) {
      await GamificationService.createBadge(badge.value, route.params.projectId);
    } else {
      await GamificationService.update(badge.value, route.params.projectId);
    }
    toast.success(isNew.value ? t('admin.badge_created_success') : t('admin.badge_updated_success'));
    await router.push(`/admin/project/${route.params.projectId}/gamification`);
  } catch (error) {
    console.error('Error al guardar la insignia:', error);
    toast.error(t('admin.badge_save_error'));
  }
};

// Cargar datos al montar
onMounted(() => {
  const badgeId = route.params.id;
  if (badgeId === 'new') {
    isNew.value = true;
    badge.value = {...defaultBadge};
  } else {
    isNew.value = false;
    const stateBadge = store.getters.currentBadge;
    if (stateBadge) {
      badge.value = {...defaultBadge, ...stateBadge};
    } else {
      router.push('/admin/');
    }
  }
});
</script>

<template>
  <v-container>
    <BreadCrumb items="badgePath"/>
    <h1 class="mb-6">{{ isNew ? $t('admin.create_badge') : $t('admin.edit_badge') }}</h1>

    <v-form @submit.prevent="saveBadge">
      <!-- Información de la Insignia -->
      <v-card class="pa-4 mb-6">
        <h2>{{ $t('admin.badge_info') }}</h2>
        <v-text-field :label="$t('admin.badge_name_label')" v-model="badge.name" :disabled="!isNew" required/>
        <v-textarea :label="$t('admin.badge_description_label')" v-model="badge.description" required/>
        <v-text-field :label="$t('admin.project_image_label')" v-model="badge.imageUrl" required/>
        <v-row class="my-3" v-if="badge.imageUrl">
          <v-col cols="12" sm="6" md="4">
            <v-img :src="badge.imageUrl" :alt="$t('common.image_preview')" contain max-height="200">
              <template #error>
                <v-alert density="compact" variant="tonal" color="error" class="ma-0">
                  {{ $t('common.image_load_error') }}
                </v-alert>
              </template>
            </v-img>
          </v-col>
        </v-row>
        <v-text-field
            :label="$t('admin.checkins_amount_label')"
            v-model.number="badge.checkinsAmount"
            type="number"
            min="1"
            required
        />
        <v-checkbox
            :label="$t('admin.must_contribute_label')"
            v-model="badge.mustContribute"
        />

        <v-select
            :label="$t('admin.previous_badges_label')"
            v-model="badge.previousBadges"
            :items="badgeOptions"
            multiple
            chips
        />
        <v-select
            :label="$t('admin.task_type')"
            v-model="badge.taskType"
            :items="taskTypeOptions"
            required
        />
        <v-select
            :label="$t('admin.map')"
            v-model="badge.areaId"
            :items="areaOptions"
            required
        />
        <v-select
            :label="$t('admin.interval_name_label')"
            v-model="badge.timeIntervalId"
            :items="intervalOptions"
            required
        />
      </v-card>

      <!-- Botón de guardar -->
      <v-btn type="submit" variant="elevated" color="primary" width="100%">
        {{ isNew ? $t('admin.create_badge') : $t('admin.update_badge') }}
      </v-btn>
    </v-form>
  </v-container>
</template>
