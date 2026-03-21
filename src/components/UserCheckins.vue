<template>
  <h2 class="mt-4">{{ $t('checkin.your_last_checkins') || 'Tus últimos checkins' }}</h2>
  <div class="user-checkins">
    <ul v-if="checkins && checkins.length">
      <li v-for="c in checkins" :key="c._id" class="checkin">
        <div class="row">
          <div class="datetime">{{ formatDate(c.datetime) }} </div>
          <div class="task">{{ c.taskType || '-' }}</div>
          <v-chip v-if="c.contributesTo" variant="outlined" color="green" size="small">{{ $t('checkin.task_solved') || 'Tarea resuelta' }}</v-chip>
          <v-chip v-if="!c.contributesTo" variant="outlined" color="gray" size="small">{{ $t('checkin.no_contribution') || 'No contribuye' }}</v-chip>
        </div>
        
        <!-- Sección de Imágenes -->
        <div v-if="getImageRefs(c).length > 0" class="images-section mt-2">
          <div v-if="!isExpanded(c._id)" class="d-flex align-center">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="mdi-image"
              @click="toggleExpand(c._id)"
            >
              {{ $t('checkin.see_images') || 'Ver imágenes' }}
              ({{ getImageRefs(c).length }})
            </v-btn>
          </div>
          
          <v-row v-else dense>
            <v-col cols="12" class="mb-1">
              <v-btn variant="text" size="x-small" @click="toggleExpand(c._id)">
                {{ $t('common.hide') || 'Ocultar' }}
              </v-btn>
            </v-col>
            <v-col v-for="(ref, index) in getImageRefs(c)" :key="index" cols="4" sm="3" md="2">
              <v-img
                :src="getImageUrl(ref)"
                aspect-ratio="1"
                class="rounded-lg grey lighten-2 cursor-pointer"
                @click="openImage(ref)"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </div>
      </li>
    </ul>
    <div v-else class="empty">{{ $t('checkin.no_checkins') || 'No hay checkins.' }}</div>

    <!-- Diálogo para ver imagen ampliada -->
    <v-dialog v-model="imageDialog" max-width="90vw">
      <v-card>
        <v-img :src="getImageUrl(selectedImage)" contain max-height="80vh"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="imageDialog = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  checkins: {
    type: Array,
    default: () => []
  }
});

const imageDialog = ref(false);
const selectedImage = ref('');
const expandedCheckins = reactive({});

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getImageRefs = (checkin) => {
  if (checkin.imageRefs && Array.isArray(checkin.imageRefs)) {
    return checkin.imageRefs;
  }
  if (checkin.imageRef) {
    return [checkin.imageRef];
  }
  return [];
};

const getImageUrl = (ref) => {
  if (!ref) return '';
  if (ref.startsWith('http')) return ref;
  
  const baseUrl = import.meta.env.VITE_ROOT_API || 'http://localhost:3000/v1';
  return `${baseUrl}/storage/file?key=${ref}`;
};

const openImage = (ref) => {
  selectedImage.value = ref;
  imageDialog.value = true;
};

const isExpanded = (id) => !!expandedCheckins[id];

const toggleExpand = (id) => {
  expandedCheckins[id] = !expandedCheckins[id];
};
</script>

<style scoped>
.user-checkins { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
.checkin { border: 1px solid #eee; padding: 12px; margin-bottom: 12px; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; }
.datetime { font-size: 0.9em; color: #555; }
.task { font-size: 0.95em; color: #333; }
.empty { color: #888; padding: 20px; text-align: center; font-style: italic; }
.cursor-pointer { cursor: pointer; }
.mt-4 { margin-top: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
</style>
