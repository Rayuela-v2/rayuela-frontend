<script setup>
import {onMounted, ref, watch} from 'vue';
import 'ol/ol.css';
import {Map, Overlay, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import {Style, Fill, Stroke, Text} from 'ol/style';
import {toast} from "vue3-toastify";
import {fromLonLat} from 'ol/proj';
import 'ol/geom/Point';
import 'ol/style/Circle';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Circle from 'ol/style/Circle';

const props = defineProps({
  area: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
  },
  visualization: Boolean
});

const emit = defineEmits(['update-area', 'selected-area']);

const area = ref(props.area);
const tab = ref('map');
const map = ref(null);
const areaJSON = ref(JSON.stringify(area.value, null, 2));
const error = ref('');

const createAreaStyle = (feature) => {
  return new Style({
    stroke: new Stroke({
      color: getTaskArrayFromFeature(feature).length > 0 ? '#319FD3' : 'lightgray',
      width: 2
    }),
    fill: new Fill({
      color: getTaskArrayFromFeature(feature).length > 0 ? 'rgba(0, 0, 255, 0.1)' : 'rgba(0, 0, 255, 0.06)',
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      text: `${feature.getId()}`,
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

function getTaskArrayFromFeature(feature) {
  return props.tasks ? props.tasks.filter(task => task.areaGeoJSON.properties.id === feature.getId()) : [""];
}

function tasksForFeature(feature) {
  const ts = getTaskArrayFromFeature(feature);
  if (ts.length === 0) return "No hay tareas en esta area";
  return `<h3>Área ${feature.getId()}<h3/> <br> <h4>${ts.length} tareas disponibles</h4>`;
}

const setTooltipContentToAreas = (map, vectorSource) => {
  // Crear el elemento HTML para el tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'white';
  tooltip.style.border = '1px solid black';
  tooltip.style.padding = '5px';
  tooltip.style.display = 'none';
  tooltip.style.pointerEvents = 'none';

  const overlay = new Overlay({
    source: vectorSource,
    element: tooltip,
    offset: [10, 0], // Ajuste para que no esté justo bajo el cursor
    positioning: 'bottom-left',
  })
  map.value.addOverlay(overlay);
  map.value.on('click', (event) => {
    if (!overlay) {
      console.error('El overlay no está definido');
      return;
    }
    const feature = map.value.forEachFeatureAtPixel(event.pixel, (f) => f);
    if (feature) {
      emit('selected-area', feature.getId());
      tooltip.innerHTML = tasksForFeature(feature);
      tooltip.style.display = 'block';
      overlay.setPosition(event.coordinate);
    } else {
      tooltip.style.display = 'none';
      overlay.setPosition(undefined);
    }
  });
};
const addCurrentLocationToMap = () => {
  if (!map.value) return;
  if (!navigator.geolocation) {
    toast.warning("La geolocalización no está disponible en este navegador.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = fromLonLat([position.coords.longitude, position.coords.latitude]);
        const marker = new VectorLayer({
          source: new VectorSource({
            features: [
              new Feature({
                geometry: new Point(coords),
              }),
            ],
          }),
          style: new Style({
            image: new Circle({
              radius: 7,
              fill: new Fill({color: 'lightblue'}),
              stroke: new Stroke({color: 'white', width: 2}),
            }),
            text: new Text({
              text: 'Tu ubicación',
              font: '12px Calibri,sans-serif',
              fill: new Fill({color: '#000'}),
              stroke: new Stroke({color: '#fff', width: 2}),
              offsetY: -15
            })
          }),
        });
        map.value.addLayer(marker);
        map.value.getView().setCenter(coords);
        map.value.getView().setZoom(15);
      },
      () => {
        toast.warning("No se pudo obtener la ubicación actual.");
      }
  );
};

const initializeMap = () => {
  if (!map.value && tab.value === 'map') {
    try {
      if (!isValidGeoJSON(area.value)) {
        throw new Error('GeoJSON inválido');
      }

      const features = new GeoJSON().readFeatures(area.value, {
        featureProjection: 'EPSG:3857'
      });

      features.forEach((feature) => {
        feature.setId(feature.getProperties().id);
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
      props.tasks && setTooltipContentToAreas(map, vectorSource);
      const extent = vectorSource.getExtent();
      map.value.getView().fit(extent, {padding: [20, 20, 20, 20], maxZoom: 18});
      addCurrentLocationToMap();
    } catch (error) {
      console.error('Error inicializando el mapa:', error.message);
      toast.error(error.message);
    }
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
      feature.setId(`${feature.getProperties().id}`);
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
      emit('update-area', parsedJSON); // Emitir el evento
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
  if (geojson.type !== 'FeatureCollection') {
    toast.warning("El campo type del geoJSON debe ser FeatureCollection");
  }
  if (!Array.isArray(geojson.features)) {
    toast.warning("El campo features del geoJSON debe ser un array");
  }
  if (!geojson.features.every((feature) => feature.properties && feature.properties.id)) {
    toast.warning("Algun campo feature del geoJSON no tiene id");
  }

  const availableTypes = ['Polygon', 'Feature'];
  if (!geojson.features.some((feature) => availableTypes.includes(feature.geometry.type))) {
    toast.error("Todas las areas deben ser de tipo Polygon o Feature");
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
      v-if="!visualization"
  >
    Las áreas deben estar en formato geoJSON. El JSON debe ser una FeatureCollection, y cada feature interiormente debe
    tener una propiedad <strong>id</strong>. Puedes generar las áreas manualmente en <a href="https://geojson.io/"
                                                                                        target="_blank">https://geojson.io/</a>.
  </v-alert>
  <br/>
  <v-card>
    <v-tabs v-model="tab" bg-color="black">
      <v-tab value="map">Mapa</v-tab>
      <v-tab value="mapJSON" v-if="!visualization">GeoJSON</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="map">
          <v-container>
            <div id="map" style="width: 100%; height: 400px;"></div>
            <div id="tooltip"
                 style="position: absolute; background: white; border: 1px solid black; padding: 5px; display: none; pointer-events: none; font-size: 12px;"></div>
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
