<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  timeline: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedBadgeId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['select-badge']);

const hiddenBadgeIds = ref([]);
const hoveredPoint = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });

const COLOR_PALETTE = [
  '#1976D2', // Blue
  '#388E3C', // Green
  '#F57C00', // Orange
  '#7B1FA2', // Purple
  '#0097A7', // Teal
  '#E64A19', // Deep Orange
  '#5D4037', // Brown
  '#C2185B', // Pink
  '#0288D1', // Light Blue
  '#689F38', // Light Green
];

function getBadgeColor(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

// Chart layout constants (viewBox coordinate system)
const WIDTH = 760;
const HEIGHT = 260;
const PAD_LEFT = 45;
const PAD_RIGHT = 30;
const PAD_TOP = 25;
const PAD_BOTTOM = 35;

const plotWidth = computed(() => WIDTH - PAD_LEFT - PAD_RIGHT);
const plotHeight = computed(() => HEIGHT - PAD_TOP - PAD_BOTTOM);

const timestamps = computed(() => props.timeline?.timestamps || []);
const threshold = computed(() => props.timeline?.threshold ?? 0.2);

const thresholdY = computed(() => {
  const normY = Math.max(0, Math.min(1, threshold.value));
  return PAD_TOP + (1 - normY) * plotHeight.value;
});

const seriesList = computed(() => {
  const list = props.timeline?.series || [];
  return list.map((s, idx) => ({
    ...s,
    color: getBadgeColor(idx),
    visible: !hiddenBadgeIds.value.includes(s.badgeId),
    isSelected: props.selectedBadgeId && s.badgeId === props.selectedBadgeId,
  }));
});

const hasData = computed(() => {
  return Boolean(
    props.timeline &&
    Array.isArray(props.timeline.timestamps) &&
    props.timeline.timestamps.length > 0 &&
    Array.isArray(props.timeline.series) &&
    props.timeline.series.length > 0
  );
});

function getX(index) {
  const count = timestamps.value.length;
  if (count <= 1) return PAD_LEFT + plotWidth.value / 2;
  return PAD_LEFT + (index / (count - 1)) * plotWidth.value;
}

function getY(val) {
  if (val === null || val === undefined || Number.isNaN(val)) return null;
  const clamped = Math.max(0, Math.min(1, val));
  return PAD_TOP + (1 - clamped) * plotHeight.value;
}

// Builds SVG path command handling null values by breaking into disconnected segments
function buildSvgPath(points) {
  const segments = [];
  let currentSegment = [];

  points.forEach((val, idx) => {
    const y = getY(val);
    if (y !== null) {
      currentSegment.push(`${getX(idx).toFixed(1)},${y.toFixed(1)}`);
    } else {
      if (currentSegment.length > 0) {
        segments.push(`M ${currentSegment.join(' L ')}`);
        currentSegment = [];
      }
    }
  });

  if (currentSegment.length > 0) {
    segments.push(`M ${currentSegment.join(' L ')}`);
  }

  return segments.join(' ');
}

// Format axis timestamps for display
function formatDateLabel(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

const xTicks = computed(() => {
  const count = timestamps.value.length;
  if (count === 0) return [];
  if (count <= 6) {
    return timestamps.value.map((tStr, idx) => ({
      x: getX(idx),
      label: formatDateLabel(tStr),
    }));
  }

  // Pick ~5-6 distributed ticks
  const step = Math.ceil(count / 5);
  const ticks = [];
  for (let i = 0; i < count; i += step) {
    ticks.push({ x: getX(i), label: formatDateLabel(timestamps.value[i]) });
  }
  // Ensure last tick is represented
  if (ticks[ticks.length - 1].x !== getX(count - 1)) {
    ticks.push({
      x: getX(count - 1),
      label: formatDateLabel(timestamps.value[count - 1]),
    });
  }
  return ticks;
});

const yTicks = [
  { val: 1.0, label: '1.0' },
  { val: 0.8, label: '0.8' },
  { val: 0.6, label: '0.6' },
  { val: 0.4, label: '0.4' },
  { val: 0.2, label: '0.2' },
  { val: 0.0, label: '0.0' },
];

function toggleBadgeVisibility(badgeId) {
  const idx = hiddenBadgeIds.value.indexOf(badgeId);
  if (idx !== -1) {
    hiddenBadgeIds.value.splice(idx, 1);
  } else {
    hiddenBadgeIds.value.push(badgeId);
  }
}

function onPointHover(series, idx, val, event) {
  if (val === null) return;
  const rect = event.target.getBoundingClientRect();
  hoveredPoint.value = {
    badgeName: series.badgeName,
    cii: val,
    date: timestamps.value[idx],
    color: series.color,
  };
  tooltipPos.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10,
  };
}

function onPointLeave() {
  hoveredPoint.value = null;
}

function onSelectBadge(badgeId) {
  emit('select-badge', badgeId);
}
</script>

<template>
  <div class="timeseries-chart-wrapper">
    <!-- Empty / No Data state -->
    <div v-if="!loading && !hasData" class="chart-empty pa-6 text-center text-medium-emphasis">
      <v-icon size="40" color="grey-lighten-1" class="mb-2">mdi-chart-timeline-variant-shimmer</v-icon>
      <div>{{ $t('admin.fading_chart_no_data') }}</div>
      <div class="text-caption mt-1">{{ $t('admin.fading_chart_no_data_hint') }}</div>
    </div>

    <div v-else class="chart-container">
      <!-- Loading indicator -->
      <div v-if="loading" class="chart-loading-overlay d-flex align-center justify-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- SVG Chart -->
      <svg
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
        class="timeseries-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Horizontal grid lines & Y-axis labels -->
        <g class="grid-y">
          <g v-for="tick in yTicks" :key="tick.val">
            <line
              :x1="PAD_LEFT"
              :x2="WIDTH - PAD_RIGHT"
              :y1="getY(tick.val)"
              :y2="getY(tick.val)"
              stroke="#E0E0E0"
              stroke-width="1"
            />
            <text
              :x="PAD_LEFT - 8"
              :y="getY(tick.val) + 4"
              text-anchor="end"
              class="axis-label"
            >
              {{ tick.label }}
            </text>
          </g>
        </g>

        <!-- X-axis labels & vertical tick marks -->
        <g class="axis-x">
          <g v-for="(tick, idx) in xTicks" :key="idx">
            <line
              :x1="tick.x"
              :x2="tick.x"
              :y1="HEIGHT - PAD_BOTTOM"
              :y2="HEIGHT - PAD_BOTTOM + 4"
              stroke="#BDBDBD"
            />
            <text
              :x="tick.x"
              :y="HEIGHT - PAD_BOTTOM + 16"
              text-anchor="middle"
              class="axis-label"
            >
              {{ tick.label }}
            </text>
          </g>
        </g>

        <!-- Reference Threshold Line (x = 0.20) -->
        <g class="threshold-line-group">
          <line
            :x1="PAD_LEFT"
            :x2="WIDTH - PAD_RIGHT"
            :y1="thresholdY"
            :y2="thresholdY"
            stroke="#E53935"
            stroke-width="1.5"
            stroke-dasharray="5 3"
          />
          <text
            :x="WIDTH - PAD_RIGHT"
            :y="thresholdY - 5"
            text-anchor="end"
            class="threshold-label"
          >
            {{ $t('admin.fading_chart_threshold_label', { threshold }) }}
          </text>
        </g>

        <!-- Series Lines -->
        <g v-for="s in seriesList" :key="s.badgeId">
          <g v-if="s.visible" class="badge-series">
            <!-- Background glow for selected badge -->
            <path
              v-if="s.isSelected"
              :d="buildSvgPath(s.points)"
              fill="none"
              :stroke="s.color"
              stroke-width="8"
              stroke-opacity="0.25"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Main curve line -->
            <path
              :d="buildSvgPath(s.points)"
              fill="none"
              :stroke="s.color"
              :stroke-width="s.isSelected ? 3.5 : s.isCandidate ? 2.5 : 1.5"
              :stroke-dasharray="s.status === 'expired' ? '4 2' : 'none'"
              :stroke-opacity="s.status === 'expired' ? 0.45 : 1"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="series-path"
              @click="onSelectBadge(s.badgeId)"
            />

            <!-- Data point dots -->
            <g v-for="(val, idx) in s.points" :key="idx">
              <circle
                v-if="getY(val) !== null"
                :cx="getX(idx)"
                :cy="getY(val)"
                :r="s.isSelected ? 5 : 3.5"
                :fill="s.color"
                stroke="#FFFFFF"
                stroke-width="1.5"
                class="data-dot"
                @mouseenter="onPointHover(s, idx, val, $event)"
                @mouseleave="onPointLeave"
                @click="onSelectBadge(s.badgeId)"
              />
            </g>
          </g>
        </g>
      </svg>

      <!-- Badge Series Legend -->
      <div class="chart-legend mt-3 d-flex flex-wrap gap-2">
        <div
          v-for="s in seriesList"
          :key="s.badgeId"
          class="legend-item mr-2 mb-1"
          :class="{ 'legend-item--selected': s.isSelected, 'legend-item--hidden': !s.visible }"
          @click="onSelectBadge(s.badgeId)"
        >
          <span
            class="legend-color-dot mr-1"
            :style="{ backgroundColor: s.color, opacity: s.visible ? 1 : 0.4 }"
          />
          <span :class="{ 'text-decoration-line-through text-disabled': !s.visible }">
            {{ s.badgeName }}
          </span>
          <span
            class="legend-eye-btn ml-1"
            @click.stop="toggleBadgeVisibility(s.badgeId)"
          >
            {{ s.visible ? '👁' : '✕' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Floating Hover Tooltip -->
    <Teleport to="body">
      <div
        v-if="hoveredPoint"
        class="timeseries-tooltip elevation-3"
        :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
      >
        <div class="d-flex align-center">
          <span
            class="legend-color-dot mr-1"
            :style="{ backgroundColor: hoveredPoint.color }"
          />
          <strong>{{ hoveredPoint.badgeName }}</strong>
        </div>
        <div class="text-caption mt-1">
          <span>CII: </span>
          <strong>{{ hoveredPoint.cii.toFixed(4) }}</strong>
          <span class="ml-2 text-medium-emphasis">
            ({{ formatDateLabel(hoveredPoint.date) }})
          </span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.timeseries-chart-wrapper {
  position: relative;
  width: 100%;
}

.chart-container {
  position: relative;
  width: 100%;
}

.timeseries-svg {
  width: 100%;
  height: auto;
  max-height: 280px;
  display: block;
}

.axis-label {
  font-size: 11px;
  fill: #757575;
  font-family: 'Roboto', sans-serif;
  user-select: none;
}

.threshold-label {
  font-size: 10px;
  fill: #D32F2F;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
  user-select: none;
}

.series-path {
  cursor: pointer;
  transition: stroke-width 0.2s;
}

.series-path:hover {
  stroke-width: 4px;
}

.data-dot {
  cursor: pointer;
  transition: r 0.15s;
}

.data-dot:hover {
  r: 6px;
}

.legend-color-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 12px;
  background: #F5F5F5;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.legend-item:hover {
  background: #EEEEEE;
}

.legend-item--selected {
  border-color: #1976D2;
  background: #E3F2FD;
  font-weight: 500;
}

.legend-item--hidden {
  opacity: 0.6;
}

.legend-eye-btn {
  font-size: 11px;
  opacity: 0.6;
  padding: 0 2px;
}

.legend-eye-btn:hover {
  opacity: 1;
}

.timeseries-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  background: rgba(33, 33, 33, 0.95);
  color: #FFFFFF;
  padding: 6px 12px;
  border-radius: 6px;
  pointer-events: none;
  font-size: 12px;
  z-index: 9999;
}
</style>
