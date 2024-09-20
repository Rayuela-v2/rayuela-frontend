<script setup>
import {onMounted, ref, watch} from 'vue';
import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';

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

const initializeMap = () => {
  if (!map.value && tab.value === 'map') {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(area.value, {
        featureProjection: 'EPSG:3857'
      })
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
        zoom: 10
      })
    });

    const extent = vectorSource.getExtent();
    map.value.getView().fit(extent, { padding: [20, 20, 20, 20] });
  }
};

onMounted(() => {
  initializeMap();
});

// Watch para actualizar el textarea cuando el área cambie
watch(area, (newArea) => {
  areaJSON.value = JSON.stringify(newArea, null, 2);
  if (map.value) {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(newArea, {
        featureProjection: 'EPSG:3857'
      })
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    map.value.setLayers([new TileLayer({ source: new OSM() }), vectorLayer]);

    const extent = vectorSource.getExtent();
    map.value.getView().fit(extent, { padding: [20, 20, 20, 20] });
  }
});

const updateAreaFromJSON = (json) => {
  try {
    area.value = JSON.parse(json);
  } catch (e) {
    console.error('Error parsing JSON:', e);
  }
};
</script>

<template >
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
            />
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#map {
  height: 400px;
  width: 100%;
}
</style>
