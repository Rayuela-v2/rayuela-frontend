<template>
  <div>
    <!-- Botón para abrir el modal -->
    <v-btn color="blue" variant="elevated" block size='large' @click="openModal">
      <v-icon style="margin-right: 8px" left size="large">mdi-map-marker-plus</v-icon>
      Registrar Check-in
    </v-btn>

    <!-- Modal principal para registrar el check-in -->
    <v-dialog v-model="showModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Registrar Check-in</span>
        </v-card-title>

        <v-card-text>
          <!-- Spinner mientras se busca la ubicación -->
          <div v-if="loadingLocation" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Estamos buscando tu localización...</p>
          </div>

          <!-- Formulario -->
          <v-form v-else>
            <!-- Sección: Ubicación -->
            <h4>Ubicación</h4>
            <v-row>
              <v-col cols="6">
                <v-text-field
                    label="Latitud"
                    v-model="form.latitude"
                    type="number"
                    :readonly="!manualLocation"
                    outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                    label="Longitud"
                    type="number"
                    v-model="form.longitude"
                    :readonly="!manualLocation"
                    outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn variant="plain" @click="toggleManualLocation">
                  {{ manualLocation ? 'Usar ubicación automática' : 'Ingresar ubicación manualmente' }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Sección: Fecha y Hora -->
            <h4 class="mt-4">Fecha y Hora</h4>
            <v-text-field
                label="Timestamp"
                v-model="form.datetime"
                type="datetime-local"
                outlined
            ></v-text-field>

            <!-- Sección: Tipo de Tarea -->
            <h4 class="mt-4">Tipo de Tarea</h4>
            <v-select
                label="Tipo de tarea"
                v-model="form.taskType"
                :items="props.taskTypes"
                outlined
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeModal" :disabled="loadingCheckin">Cancelar</v-btn>
          <v-btn
              color="primary"
              @click="submitForm"
              :disabled="loadingCheckin"
          >
            <template v-if="loadingCheckin">
              <v-progress-circular indeterminate color="white" size="20" class="mr-2"></v-progress-circular>
              Guardando...
            </template>
            <template v-else>Guardar</template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación -->
    <v-dialog v-model="serviceResponse" persistent max-width="400px">
      <v-card>
        <v-card-text class="text-center">
          <v-icon color="green" size="48">mdi-check-circle-outline</v-icon>
          <h3>¡Checkin registrado!</h3>
          <div style="border: 2px dashed lightblue; border-radius: 18px"
               v-for="(badge, index) in serviceResponse?._gameStatus?.newBadges" :key="index" class="badge-item">
            <img :src="badge.imageUrl" alt="Imagen de la insignia"/>
            <h6>{{ badge.name }}</h6>
          </div>
          <p v-if="serviceResponse?._gameStatus?.newPoints">
            Sumaste {{ serviceResponse._gameStatus.newPoints }}
            puntos!</p>
          <p v-if="serviceResponse?.contributesTo">Contribuiste a {{ serviceResponse.contributesTo?.name }}</p>
          <p v-else>No contribuiste a ninguna tarea</p>
          <v-alert v-if="serviceResponse?.contributesTo"
                   width="100%"
          >
            <h4>Como sentiste la tarea?</h4>
            <hr>
            <v-rating v-model="form.rating" background-color="grey lighten-2" color="orange"
                      :item-labels="['Aburrida', '', '', '', 'Divertida']"
                      item-label-position="bottom" large></v-rating>
          </v-alert>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeConfirmationModal">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {toast} from "vue3-toastify";
import GamificationService from "@/services/GamificationService";


const emit = defineEmits(['modalClosed']);
const route = useRoute();

const showModal = ref(false);
const serviceResponse = ref(null);
const manualLocation = ref(false);
const loadingLocation = ref(false);
const loadingCheckin = ref(false); // Spinner para el registro de check-in
const props = defineProps({
  taskTypes: Array,
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
    toast.info('La geolocalización no es compatible con este navegador.');
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
        toast.info('No se pudo obtener la ubicación. Por favor ingrésela manualmente.');
        manualLocation.value = true;
        loadingLocation.value = false;
      }
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
    toast.info('Por favor completa todos los campos.');
    return;
  }

  loadingCheckin.value = true; // Inicia el spinner

  GamificationService.registerCheckin({...form.value, projectId: route.params.projectId})
      .then((res) => {
        serviceResponse.value = res;
      })
      .catch(() => toast.error('Ha ocurrido un error en el registro.'))
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