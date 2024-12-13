<template>
  <div>
    <!-- Botón para abrir el modal -->
    <v-btn color="black" block large @click="openModal">
      <v-icon left size="large">mdi-map-marker-plus</v-icon>
      Registrar Check-in
    </v-btn>

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
          <v-btn text @click="closeModal">Cancelar</v-btn>
          <v-btn color="primary" @click="submitForm">Guardar</v-btn>
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

const route = useRoute();

const showModal = ref(false);
const manualLocation = ref(false);
const loadingLocation = ref(false);
const props = defineProps({
  taskTypes: Array,
})

const form = ref({
  latitude: '',
  longitude: '',
  datetime: '',
  taskType: '',
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
};

const submitForm = () => {
  if (!form.value.latitude || !form.value.longitude || !form.value.taskType) {
    toast.info('Por favor completa todos los campos.');
    return;
  }

  GamificationService.registerCheckin({...form.value, projectId: route.params.projectId})
      .then(() => toast.success('Checkin registrado correctamente'))
      .catch(() => toast.error('Ha ocurrido un error en el registro.'))
      .then(closeModal)
};

watch(showModal, (isVisible) => {
  if (isVisible) {
    form.value.datetime = new Date().toISOString().slice(0, 16);
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
</style>