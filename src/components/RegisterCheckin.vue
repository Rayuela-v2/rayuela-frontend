<template>
  <div>
    <!-- Botón para abrir el modal -->
    <v-btn color="blue" variant="elevated" block size='large' @click="openModal">
      <v-icon style="margin-right: 8px" left size="large">mdi-map-marker-plus</v-icon>
      {{ $t('checkin.button_register') }}
    </v-btn>

    <!-- Modal principal para registrar el check-in -->
    <v-dialog v-model="showModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ $t('checkin.title_register') }}</span>
        </v-card-title>

        <v-card-text>
          <!-- Spinner mientras se busca la ubicación -->
          <div v-if="loadingLocation" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>{{ $t('checkin.searching_location') }}</p>
          </div>

          <!-- Formulario -->
          <v-form v-else>
            <!-- Sección: Ubicación -->
            <h4>{{ $t('checkin.location') }}</h4>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    :label="$t('checkin.latitude')"
                    v-model="form.latitude"
                    type="number"
                    :readonly="!manualLocation"
                    outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    :label="$t('checkin.longitude')"
                    type="number"
                    v-model="form.longitude"
                    :readonly="!manualLocation"
                    outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn variant="plain" v-if="props.manualLocationEnabled" @click="toggleManualLocation">
                  {{ manualLocation ? $t('checkin.use_auto_location') : $t('checkin.use_manual_location') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sección: Fecha y Hora -->
            <h4 class="mt-4">{{ $t('checkin.date_time') }}</h4>
            <v-text-field
                :label="$t('checkin.timestamp')"
                v-model="form.datetime"
                type="datetime-local"
                outlined
            ></v-text-field>

            <!-- Sección: Tipo de Tarea -->
            <h4 class="mt-4">{{ $t('checkin.task_type_label') }}</h4>
            <v-select
                :label="$t('checkin.task_type_label')"
                v-model="form.taskType"
                :items="props.taskTypes"
                outlined
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeModal" :disabled="loadingCheckin">{{ $t('common.cancel') }}</v-btn>
          <v-btn
              color="primary"
              @click="submitForm"
              :disabled="loadingCheckin"
          >
            <template v-if="loadingCheckin">
              <v-progress-circular indeterminate color="white" size="20" class="mr-2"></v-progress-circular>
              {{ $t('common.saving') }}
            </template>
            <template v-else>{{ $t('common.save') }}</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación -->
    <v-dialog v-model="serviceResponse" persistent max-width="400px">
      <v-card>
        <v-card-text class="text-center">
          <v-icon color="green" size="48">mdi-check-circle-outline</v-icon>
          <h3>{{ $t('checkin.registered_success') }}</h3>
          <div style="border: 2px dashed lightblue; border-radius: 18px"
               v-for="(badge, index) in serviceResponse?._gameStatus?.newBadges" :key="index" class="badge-item">
            <h4>{{ $t('checkin.new_badge') }}</h4>
            <img :src="badge.imageUrl" alt="Imagen de la insignia"/>
            <h6>{{ badge.name }}</h6>
            <small>{{ badge.description }}</small>
          </div>
          <p v-if="serviceResponse?._gameStatus?.newPoints">
            {{ $t('checkin.points_added', { points: serviceResponse._gameStatus.newPoints }) }}
          </p>
          <p v-if="serviceResponse?.contributesTo">{{ $t('checkin.contributed_to', { name: serviceResponse.contributesTo?.name }) }}</p>
          <p v-else>{{ $t('checkin.no_contribution') }}</p>
          <v-alert v-if="serviceResponse?.contributesTo"
                   width="100%"
          >
            <h4>{{ $t('checkin.how_did_you_feel') }}</h4>
            <hr>
            <v-rating v-model="form.rating" background-color="grey lighten-2" color="orange"
                      :item-labels="[$t('checkin.rating_boring'), '', '', '', $t('checkin.rating_fun')]"
                      item-label-position="bottom" large></v-rating>
          </v-alert>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeConfirmationModal">{{ $t('common.accept') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {toast} from "vue3-toastify";
import { useI18n } from 'vue-i18n';
import GamificationService from "@/services/GamificationService";

const { t } = useI18n();


const emit = defineEmits(['modalClosed']);
const route = useRoute();

const showModal = ref(false);
const serviceResponse = ref(null);
const manualLocation = ref(false);
const loadingLocation = ref(false);
const loadingCheckin = ref(false); // Spinner para el registro de check-in
const props = defineProps({
  taskTypes: Array,
  manualLocationEnabled: Boolean
});

const form = ref({
  latitude: '',
  longitude: '',
  datetime: '',
  taskType: '',
  rating: 0,
});

const openModal = () => {
  resetForm();
  showModal.value = true;
  loadingLocation.value = true;
  getCurrentLocation();
};

const toggleManualLocation = () => {
  manualLocation.value = !manualLocation.value;
  if (!manualLocation.value) {
    getCurrentLocation();
  }
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.info(t('checkin.geo_not_supported'));
    manualLocation.value = true;
    loadingLocation.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
      (position) => {
        form.value.latitude = position.coords.latitude.toFixed(6);
        form.value.longitude = position.coords.longitude.toFixed(6);
        loadingLocation.value = false;
      },
      () => {
        toast.info(t('checkin.geo_failed'));
        manualLocation.value = true;
        loadingLocation.value = false;
      },
      { enableHighAccuracy: true }
  );
};

const resetForm = () => {
  form.value = {
    latitude: '',
    longitude: '',
    datetime: new Date().toISOString().slice(0, 16),
    taskType: '',
  };
  manualLocation.value = false;
};

const closeModal = () => {
  showModal.value = false;
  loadingCheckin.value = false;
};

const closeConfirmationModal = async () => {
  if (serviceResponse.value.contributesTo) {
    await GamificationService.rate(form.value.rating, serviceResponse.value.id);
  }
  serviceResponse.value = null;
  emit('modalClosed');
};

const submitForm = () => {
  if (!form.value.latitude || !form.value.longitude || !form.value.taskType) {
    toast.info(t('common.complete_all_fields'));
    return;
  }

  loadingCheckin.value = true; // Inicia el spinner

  GamificationService.registerCheckin({...form.value, projectId: route.params.projectId})
      .then((res) => {
        serviceResponse.value = res;
      })
      .catch(() => toast.error(t('checkin.register_error')))
      .finally(() => {
        loadingCheckin.value = false; // Detiene el spinner
        closeModal();
      });
};

watch(showModal, (isVisible) => {
  if (isVisible) {
    const now = new Date();
    const gmtMinus3 = new Date(now.getTime() - 3 * 60 * 60 * 1000); // GMT-3
    form.value.datetime = gmtMinus3.toISOString().slice(0, 16);
  }
});
</script>

<style scoped>
.text-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mt-4 {
  margin-top: 16px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
