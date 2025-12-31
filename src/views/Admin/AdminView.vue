<script setup>
import {onMounted, ref} from "vue";
import ProjectsService from "@/services/ProjectsService";
import {useRouter} from "vue-router";
import {toast} from "vue3-toastify";
import {store} from "@/vuex/state";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const projects = ref([]);
const headers = ref([
  {title: t('admin.project_name'), value: 'name', sortable: true},
  {title: t('common.actions'), value: 'actions', sortable: false}
]);

const selectedProject = ref(null);
const dialogDisable = ref(false);

const router = useRouter();

onMounted(async () => {
  store.commit('setProject', null)
  store.commit('setCurrentGamification', null)
  projects.value = await ProjectsService.getAdminProjects();
});

const editProject = (project) => {
  router.push(`/admin/project/${project._id}/data`);
};

const editGamification = (project) => {
  store.commit("setProject", project)
  router.push(`/admin/project/${project._id}/gamification`);
};

const addProject = async () => {
  const newP = await ProjectsService.createProject({
    name: t("admin.new_project_default_name"),
    description: t("admin.project_description_default"),
    image: "https://example.com/image.jpg",
    web: "https://example.com",
    available: true,
    areas: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {id: 1},
          geometry: {
            coordinates: [
              [
                [
                  -69.72427193222924,
                  -36.6544904309133
                ],
                [
                  -69.72437839185329,
                  -36.6544904309133
                ],
                [
                  -69.72437839185329,
                  -36.65452925237721
                ],
                [
                  -69.72427193222924,
                  -36.65452925237721
                ],
                [
                  -69.72427193222924,
                  -36.6544904309133
                ]
              ]
            ],
            type: "Polygon"
          }
        }
      ]
    },
    ownerId: localStorage.getItem("user_id")
  });
  router.push(`/admin/project/${newP._id}/data`);
};

const confirmDisable = (project) => {
  selectedProject.value = project;
  dialogDisable.value = true;
};

const disableProject = async () => {
  selectedProject.value.available = !selectedProject.value.available;
  await ProjectsService.toggleAvailability(selectedProject.value._id)
      .then(async () => {
        toast.success(t('admin.project_updated_success'));
        dialogDisable.value = false;
        projects.value = await ProjectsService.getAdminProjects();
      });
};
</script>

<template>
  <main>
    <h1>{{ $t('admin.my_projects') }}</h1>
    <div style="display: flex; justify-content: flex-end;">
      <v-btn color="black" @click="addProject">{{ $t('admin.add_project') }}</v-btn>
    </div>
    <v-container>
      <v-data-table
          :headers="headers"
          :no-data-text="$t('leaderboard.no_data')"
          :items="projects"
          class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn variant="flat" v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editProject(item)">
                <v-list-item-title>{{ $t('admin.edit_data') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editGamification(item)">
                <v-list-item-title>{{ $t('admin.edit_gamification') }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="confirmDisable(item)">
                <v-list-item-title>{{ item.available ? $t('admin.hide') : $t('admin.show') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogDisable" max-width="400px">
        <v-card>
          <v-card-title class="headline">{{ $t('admin.confirm_title') }}</v-card-title>
          <v-card-text>
            <span v-html="$t('admin.confirm_message', { action: selectedProject?.available ? $t('admin.hide') : $t('admin.show'), name: selectedProject?.name })"></span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="dialogDisable = false">{{ $t('common.cancel') }}</v-btn>
            <v-btn color="warning" text @click="disableProject">{{
                selectedProject?.available ? $t('admin.hide') : $t('admin.show')
              }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </main>
</template>

<style scoped>
.component-container {
  display: inline-block;
}
</style>
