<script setup>
import { onMounted, ref, watch } from 'vue';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';

// Props
const props = defineProps({
  area: {
    type: Object,
    required: true
  }
});

const map = ref(null);

onMounted(() => {
  // Vector layer para la capa GeoJSON del área
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(props.area, {
      featureProjection: 'EPSG:3857' // Proyección estándar en OpenLayers
    })
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource
  });

  // Inicializa el mapa
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer
    ],
    view: new View({
      center: fromLonLat([0, 0]), // Centro temporal antes de ajustar al área
      zoom: 10
    })
  });

  // Centra el mapa en el área GeoJSON
  const extent = vectorSource.getExtent();
  map.value.getView().fit(extent, { padding: [20, 20, 20, 20] });
});

// Watch para detectar cambios en el área
watch(() => props.area, (newArea) => {
  const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(newArea, {
      featureProjection: 'EPSG:3857'
    })
  });
  const vectorLayer = new VectorLayer({
    source: vectorSource
  });

  map.value.addLayer(vectorLayer);
  const extent = vectorSource.getExtent();
  map.value.getView().fit(extent, { padding: [20, 20, 20, 20] });
});
</script>

<template>
  <div id="map" style="width: 100%; height: 400px;"></div>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>
