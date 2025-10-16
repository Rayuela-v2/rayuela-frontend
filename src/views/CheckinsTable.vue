<template>
  <v-container>
    <v-card>
      <v-card-title>
        Check-ins
        <v-spacer></v-spacer>
      </v-card-title>

      <v-data-table
          :headers="headers"
          :items="checkins"
          :items-per-page="5"
          :search="search"
          class="elevation-1"
          :no-data-text="'Aún no hay datos para mostrar.'"
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          dense
          loading="loading"
          no-data-text="No hay check-ins disponibles."
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Check-in Records</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
                v-model="search"
                label="Buscar"
                clearable
                class="mx-4"
            ></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:[`item.datetime`]="{ item }">
          {{ new Date(item.datetime).toLocaleString() }}
        </template>

        <template v-slot:[`item.latitude`]="{ item }">
          {{ item.latitude }}
        </template>

        <template v-slot:[`item.longitude`]="{ item }">
          {{ item.longitude }}
        </template>

        <template v-slot:[`item.contributesTo`]="{ item }">
          {{ item.contributesTo }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import GamificationService from "@/services/GamificationService";

export default {
  data() {
    return {
      search: "",
      sortBy: ["datetime"], // Campo de ordenación inicial
      sortDesc: [false], // Orden ascendente o descendente
      headers: [
        { text: "Fecha y Hora", value: "datetime" },
        { text: "Latitud", value: "latitude" },
        { text: "Longitud", value: "longitude" },
        { text: "Contribuye A", value: "contributesTo" },
      ],
      checkins: [],
      loading: false,
    };
  },
  methods: {
    async fetchCheckins() {
      try {
        this.loading = true;
        const projectId = this.$route.params.projectId; // Obtiene el projectId de la URL actual
        const response = await GamificationService.getCheckins(projectId);
        this.checkins = response.data || [];8
      } catch (error) {
        console.error("Error fetching check-ins:", error);
        this.checkins = [];
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    // Si cambia la URL (projectId), vuelve a cargar los datos
    "$route.params.projectId": "fetchCheckins",
  },
  created() {
    this.fetchCheckins();
  },
};
</script>

<style scoped>
.mx-4 {
  margin-left: 1rem;
  margin-right: 1rem;
}
</style>
