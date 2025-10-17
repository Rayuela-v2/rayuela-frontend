<script setup>
import {onMounted, onUnmounted, ref, watch} from 'vue';
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
  checkins: {
    type: Array,
  },
  visualization: Boolean
});

const UPDATE_LOCATION_TIMEOUT = 10000

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
      color: getTaskArrayFromFeature(feature).length > 0 ? 'rgba(0, 0, 255, 0.3)' : 'rgba(0, 0, 255, 0.15)',
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

function getTextCurrentLocation(features, userCoords) {
  // userCoords debe ser [x, y] en proyección EPSG:3857
  // Verifica si el usuario está dentro de algún área
  const insideFeature = features.find(feature => {
    const geom = feature.getGeometry();
    return geom && typeof geom.intersectsCoordinate === "function"
        ? geom.intersectsCoordinate(userCoords)
        : false;
  });
  if (insideFeature) {
    return `Estás dentro del área "${insideFeature.getId()}"`;
  }
  return "";
}

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

const addCurrentLocationToMap = (features) => {
  if (!map.value) return;
  if (!navigator.geolocation) {
    toast.warning("La geolocalización no está disponible en este navegador.");
    return;
  }

  const updateLocation = () => {
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
                text: getTextCurrentLocation(features, coords),
                font: '12px Calibri,sans-serif',
                fill: new Fill({color: '#000'}),
                stroke: new Stroke({color: '#fff', width: 2}),
                offsetY: -15
              })
            }),
          });

          map.value.addLayer(marker);
          setTimeout(() => {
            map.value.getLayers().removeAt(map.value.getLayers().getLength() - 1);
          }, UPDATE_LOCATION_TIMEOUT);
        },
        () => {
          toast.warning("No se pudo obtener la ubicación actual.");
        }
    );
  };

  updateLocation();

  // Actualiza la ubicación cada 15 segundos si está en modo visualización
  if (props.visualization) {
    if (addCurrentLocationToMap.intervalId) {
      clearInterval(addCurrentLocationToMap.intervalId);
    }
    addCurrentLocationToMap.intervalId = setInterval(updateLocation, UPDATE_LOCATION_TIMEOUT);
  }
};

function addCheckinsToMap(checkins) {
  if (!map.value || !Array.isArray(checkins) || checkins.length === 0) return;
  const features = checkins.map((c) => {
    const lon = parseFloat(c.longitude);
    const lat = parseFloat(c.latitude);
    if (isNaN(lon) || isNaN(lat)) return null;
    const coords = fromLonLat([lon, lat]);
    const feature = new Feature({
      geometry: new Point(coords)
    });
    feature.setId(c._id || `${lon}-${lat}`);

    const hasContributes = !!c.contributesTo;

    if (hasContributes) {
      // Mostrar una tilde (check) cuando tiene contributesTo
      feature.setStyle(new Style({
        text: new Text({
          text: '✔',
          font: 'bold 18px Calibri, sans-serif',
          fill: new Fill({ color: 'green' }),
          stroke: new Stroke({ color: '#ffffff', width: 3 }),
          offsetY: 0
        })
      }));
    } else {
      // Mostrar un círculo hueco rojo cuando no tiene contributesTo
      feature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: 'transparent' }),
          stroke: new Stroke({ color: 'red', width: 2 })
        })
      }));
    }

    return feature;
  }).filter(Boolean);
  const source = new VectorSource({features});
  const layer = new VectorLayer({source});
  if (addCheckinsToMap.layer) {
    map.value.removeLayer(addCheckinsToMap.layer);
  }
  addCheckinsToMap.layer = layer;
  map.value.addLayer(layer);
}

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
      console.log(props)
      props.visualization && addCurrentLocationToMap(features);
      props.checkins && addCheckinsToMap(props.checkins);
    } catch (error) {
      console.error('Error inicializando el mapa:', error.message);
      toast.error(error.message);
    }
  }
};
onMounted(() => {
  initializeMap();
  // Limpia el intervalo al desmontar el componente
  if (props.visualization) {
    onUnmounted(() => {
      if (addCurrentLocationToMap.intervalId) {
        clearInterval(addCurrentLocationToMap.intervalId);
      }
    });
  }
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

const centerMapOnCurrentLocation = () => {
  if (!map.value) return;
  if (!navigator.geolocation) {
    toast.warning("La geolocalización no está disponible en este navegador.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = fromLonLat([position.coords.longitude, position.coords.latitude]);
        map.value.getView().setCenter(coords);
      },
      () => {
        toast.warning("No se pudo obtener la ubicación actual.");
      }
  );
};

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
    <div style="position: relative; width: 100%; height: 400px;">
      <div id="map" style="width: 100%; height: 400px;"></div>
      <button
          @click="centerMapOnCurrentLocation"
          style="position: absolute; top: 10px; right: 10px; z-index: 10; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer;"
          title="Centrar en mi ubicación"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="black" viewBox="0 0 24 24">
          <path
              d="M12 20q-3.35 0-5.675-2.325Q4 15.35 4 12q0-3.35 2.325-5.675Q8.65 4 12 4q3.35 0 5.675 2.325Q20 8.65 20 12q0 3.35-2.325 5.675Q15.35 20 12 20Zm0-2q2.5 0 4.25-1.75T18 12q0-2.5-1.75-4.25T12 6q-2.5 0-4.25 1.75T6 12q0 2.5 1.75 4.25T12 18Zm0-6Zm0 2q-.825 0-1.413-.588Q10 12.825 10 12q0-.825.587-1.413Q11.175 10 12 10q.825 0 1.413.587Q14 11.175 14 12q0 .825-.587 1.412Q12.825 14 12 14Z"/>
        </svg>
      </button>

      <!-- Leyenda / guía para usuarios -->
      <div style="position: absolute; bottom: 10px; left: 10px; z-index: 12; background: rgba(255,255,255,0.95); border: 1px solid #ddd; padding: 8px 10px; border-radius: 6px; font-size: 13px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;background:green;color:white;border-radius:3px;font-size:11px;">✔</span>
          <span>Checkin exitoso</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:14px;height:14px;display:inline-block;border:2px solid red;border-radius:50%;box-sizing:border-box;"></span>
          <span>Checkin sin contribución</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:12px;height:12px;border-radius:50%;background:lightblue;display:inline-block;"></span>
          <span>Tu ubicación</span>
        </div>

        <!-- Leyenda para áreas -->
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:18px;height:14px;display:inline-block;background:rgba(0,0,255,0.3);border:2px solid #319FD3;border-radius:3px;box-sizing:border-box;"></span>
          <span>Área con tareas</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="width:18px;height:14px;display:inline-block;background:rgba(0,0,255,0.15);border:2px solid lightgray;border-radius:3px;box-sizing:border-box;"></span>
          <span>Área sin tareas</span>
        </div>
      </div>

      <div id="tooltip"
           style="position: absolute; background: white; border: 1px solid black; padding: 5px; display: none; pointer-events: none; font-size: 12px;"></div>
    </div>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="map">
          <v-container>
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
