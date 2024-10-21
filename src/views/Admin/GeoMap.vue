<script setup>
import {onMounted, ref, watch} from 'vue';
import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import {Style, Fill, Stroke, Text} from 'ol/style';
import {toast} from "vue3-toastify";

const props = defineProps({
  area: {
    type: Object,
    required: true
  }
});

const area = ref(props.area);
const tab = ref('map');
const map = ref(null);
const areaJSON = ref(JSON.stringify(area.value, null, 2));
const error = ref(''); // Nueva variable para mostrar errores

const createAreaStyle = (feature) => {
  return new Style({
    stroke: new Stroke({
      color: '#319FD3',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      text: feature.getId(),
      fill: new Fill({
        color: '#000'
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3
      })
    })
  });
};

const initializeMap = () => {
  if (!map.value && tab.value === 'map') {
    const features = new GeoJSON().readFeatures(area.value, {
      featureProjection: 'EPSG:3857'
    });

    features.forEach((feature) => {
      feature.setId(`A${feature.getProperties().id}`);
      feature.setStyle(createAreaStyle(feature));
    });

    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map.value = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });

    const extent = vectorSource.getExtent();
    map.value.getView().fit(extent, {padding: [20, 20, 20, 20], maxZoom: 18});
  }
};

onMounted(() => {
  initializeMap();
});

watch(area, (newArea) => {
  areaJSON.value = JSON.stringify(newArea, null, 2);
  if (map.value) {
    const features = new GeoJSON().readFeatures(newArea, {
      featureProjection: 'EPSG:3857'
    });

    features.forEach((feature) => {
      feature.setId(`A${feature.getProperties().id}`);
      feature.setStyle(createAreaStyle(feature));
    });

    const vectorSource = new VectorSource({
      features: features
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map.value.setLayers([new TileLayer({source: new OSM()}), vectorLayer]);

    const extent = vectorSource.getExtent();
    map.value.getView().fit(extent, {padding: [20, 20, 20, 20], maxZoom: 18});
  }
});

const updateAreaFromJSON = (json) => {
  try {
    const parsedJSON = JSON.parse(json);
    if (isValidGeoJSON(parsedJSON)) {
      area.value = parsedJSON;
      error.value = ''; // Limpia el error si el JSON es válido
    } else {
      throw new Error('GeoJSON inválido');
    }
  } catch (e) {
    error.value = 'El formato no corresponde a un GeoJSON válido.';
  }
};

const isValidGeoJSON = (geojson) => {
  // Verifica si el objeto tiene las propiedades esperadas de un GeoJSON
  if(geojson.type !== 'FeatureCollection') {
    toast.warning("El campo type del geoJSON debe ser FeatureCollection");
  }
  if(!Array.isArray(geojson.features)) {
    toast.warning("El campo features del geoJSON debe ser un array");
  }
  if(!geojson.features.every((feature) => feature.properties && feature.properties.id)) {
    toast.warning("Algun campo feature del geoJSON no tiene id");
  }

  return (
      geojson.type === 'FeatureCollection' &&
      Array.isArray(geojson.features) &&
      geojson.features.every((feature) => feature.properties && feature.properties.id)
  );
};
</script>

<template>
  <v-alert
      title="Importante"
      type="info"
      color="black"
      variant="tonal"
  >
    Las áreas deben estar en formato geoJSON. El JSON debe ser una FeatureCollection, y cada feature interiormente debe
    tener una propiedad <strong>id</strong>. Puedes generar las áreas manualmente en <a href="https://geojson.io/"
                                                                                        target="_blank">https://geojson.io/</a>.
  </v-alert>
  <br/>
  <v-card>
    <v-tabs v-model="tab" bg-color="black">
      <v-tab value="map">Mapa</v-tab>
      <v-tab value="mapJSON">GeoJSON</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="map">
          <v-container>
            <div id="map" style="width: 100%; height: 400px;"></div>
          </v-container>
        </v-tabs-window-item>

        <v-tabs-window-item value="mapJSON">
          <v-container>
            <v-textarea
                label="Estructura del área (GeoJSON)"
                v-model="areaJSON"
                rows="20"
                @input="updateAreaFromJSON($event.target.value)"
                :error="error !== ''"
            />
            <p v-if="error" class="error-message">{{ error }}</p>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#error {
  color: red;
  font-weight: bold;
}

#map {
  height: 400px;
  width: 100%;
}
</style>
