<script setup>
import { ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Text } from 'ol/style';
import Icon from 'ol/style/Icon';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, toLonLat } from 'ol/proj';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  areas: { type: Object, default: null },
  initialLatitude: { type: [String, Number], default: '' },
  initialLongitude: { type: [String, Number], default: '' },
});

const emit = defineEmits(['update:modelValue', 'location-selected']);

const map = ref(null);
const selectedCoords = ref(null);
const markerLayer = ref(null);
const geoErrorMessage = ref('');

const show = ref(props.modelValue);
watch(() => props.modelValue, (val) => { show.value = val; });
watch(show, (val) => { emit('update:modelValue', val); });

const createAreaStyle = (feature) => {
  return new Style({
    stroke: new Stroke({ color: '#319FD3', width: 2 }),
    fill: new Fill({ color: 'rgba(0, 0, 255, 0.12)' }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      text: `${feature.getId() || ''}`,
      fill: new Fill({ color: '#000' }),
      stroke: new Stroke({ color: '#fff', width: 3 }),
    }),
  });
};

const markerIconSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
  <path fill="#e74c3c" d="M12 2c-3.314 0-6 2.686-6 6 0 4.5 6 14 6 14s6-9.5 6-14c0-3.314-2.686-6-6-6z"/>
  <circle cx="12" cy="8" r="2.5" fill="#ffffff"/>
</svg>
`).trim();

const markerStyle = new Style({
  image: new Icon({
    src: `data:image/svg+xml;charset=UTF-8,${markerIconSvg}`,
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    scale: 1,
  }),
});

function placeMarker(coords) {
  if (!map.value) return;

  // Remove previous marker layer
  if (markerLayer.value) {
    map.value.removeLayer(markerLayer.value);
  }

  const feature = new Feature({ geometry: new Point(coords) });
  feature.setStyle(markerStyle);

  const source = new VectorSource({ features: [feature] });
  markerLayer.value = new VectorLayer({ source });
  map.value.addLayer(markerLayer.value);

  const [lng, lat] = toLonLat(coords);
  selectedCoords.value = { latitude: lat.toFixed(6), longitude: lng.toFixed(6) };
}

function initMap() {
  if (map.value) {
    map.value.setTarget(null);
    map.value = null;
  }

  const layers = [new TileLayer({ source: new OSM() })];

  // Add project areas if available
  let areaExtent = null;
  if (props.areas && props.areas.features && props.areas.features.length > 0) {
    try {
      const features = new GeoJSON().readFeatures(props.areas, {
        featureProjection: 'EPSG:3857',
      });
      features.forEach((f) => {
        f.setId(f.getProperties().id);
        f.setStyle(createAreaStyle(f));
      });
      const vectorSource = new VectorSource({ features });
      const vectorLayer = new VectorLayer({ source: vectorSource });
      layers.push(vectorLayer);
      areaExtent = vectorSource.getExtent();
    } catch (e) {
      console.warn('Could not render project areas on picker:', e);
    }
  }

  // Determine initial center
  let center = fromLonLat([0, 0]);
  let zoom = 2;

  if (props.initialLatitude && props.initialLongitude) {
    center = fromLonLat([parseFloat(props.initialLongitude), parseFloat(props.initialLatitude)]);
    zoom = 15;
  }

  map.value = new Map({
    target: 'location-picker-map',
    layers,
    view: new View({ center, zoom }),
  });

  // Fit to area extent if we have areas and no initial coords
  if (areaExtent && !props.initialLatitude && !props.initialLongitude) {
    map.value.getView().fit(areaExtent, { padding: [40, 40, 40, 40], maxZoom: 16 });
  }

  // If initial coords exist, place a marker there
  if (props.initialLatitude && props.initialLongitude) {
    placeMarker(center);
  }

  // Click handler
  map.value.on('singleclick', (evt) => {
    placeMarker(evt.coordinate);
  });
}

function confirm() {
  if (selectedCoords.value) {
    emit('location-selected', selectedCoords.value);
    show.value = false;
  }
}

function cancel() {
  selectedCoords.value = null;
  show.value = false;
}

function centerOnMe() {
  geoErrorMessage.value = '';
  if (!navigator.geolocation || !map.value) {
    geoErrorMessage.value = t('map.geolocation_not_supported') || 'Geolocation is not supported by your browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
      map.value.getView().animate({ center: coords, zoom: 16, duration: 500 });
    },
    (err) => {
      // Provide a user-friendly message for common cases
      let msg = t('map.geolocation_error_generic') || 'Could not retrieve your location.';
      if (err?.code === 1) msg = t('map.geolocation_permission_denied') || 'Location permission was denied.';
      else if (err?.code === 2) msg = t('map.geolocation_position_unavailable') || 'Location position is unavailable.';
      else if (err?.code === 3) msg = t('map.geolocation_timeout') || 'Timed out while retrieving location.';
      geoErrorMessage.value = msg;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

watch(show, async (visible) => {
  if (visible) {
    selectedCoords.value = null;
    await nextTick();
    // Small delay to let the dialog DOM render fully
    setTimeout(() => initMap(), 150);
  }
});
</script>

<template>
  <v-dialog v-model="show" max-width="700px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-map-marker</v-icon>
        {{ t('checkin.pick_location_title') }}
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 mb-3" style="color: #666;">
          {{ t('checkin.pick_location_hint') }}
        </p>

        <div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;">
          <div id="location-picker-map" style="width: 100%; height: 100%;"></div>

          <!-- Center on me button -->
          <button
            @click="centerOnMe"
            :title="t('map.center_on_location')"
            :aria-label="t('map.center_on_location')"
            style="position: absolute; top: 10px; right: 10px; z-index: 10; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer;"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="black" viewBox="0 0 24 24">
              <path d="M12 20q-3.35 0-5.675-2.325Q4 15.35 4 12q0-3.35 2.325-5.675Q8.65 4 12 4q3.35 0 5.675 2.325Q20 8.65 20 12q0 3.35-2.325 5.675Q15.35 20 12 20Zm0-2q2.5 0 4.25-1.75T18 12q0-2.5-1.75-4.25T12 6q-2.5 0-4.25 1.75T6 12q0 2.5 1.75 4.25T12 18Zm0-6Zm0 2q-.825 0-1.413-.588Q10 12.825 10 12q0-.825.587-1.413Q11.175 10 12 10q.825 0 1.413.587Q14 11.175 14 12q0 .825-.587 1.412Q12.825 14 12 14Z"/>
            </svg>
          </button>
        </div>

        <v-alert
          v-if="geoErrorMessage"
          type="warning"
          variant="tonal"
          class="mt-3"
          density="compact"
        >
          {{ geoErrorMessage }}
        </v-alert>

        <!-- Selected coordinates preview -->
        <v-alert
          v-if="selectedCoords"
          type="success"
          variant="tonal"
          class="mt-3"
          density="compact"
        >
          {{ t('checkin.selected_location') }}:
          <strong>{{ selectedCoords.latitude }}, {{ selectedCoords.longitude }}</strong>
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cancel">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" :disabled="!selectedCoords" @click="confirm">
          <v-icon left class="mr-1">mdi-check</v-icon>
          {{ t('common.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
