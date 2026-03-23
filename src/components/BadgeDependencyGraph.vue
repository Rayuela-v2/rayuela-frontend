<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { computeBadgeLayout, DEFAULT_NODE_RADIUS as NODE_RADIUS } from '@/utils/badgeGraphLayout';

const { t } = useI18n();

const props = defineProps({
  badges: { type: Array, required: true },
  readonly: { type: Boolean, default: true },
  highlightBadgeId: { type: String, default: null },
});

const emit = defineEmits(['badge-click']);

const hoveredBadge = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });

// --- DAG Layout (delegated to utility) ---

const layoutData = computed(() => computeBadgeLayout(props.badges));

// --- Edge path (curved) ---
function edgePath(edge) {
  const { from, to } = edge;
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y + NODE_RADIUS} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - NODE_RADIUS}`;
}

// Arrowhead marker offset
function arrowEnd(edge) {
  return { x: edge.to.x, y: edge.to.y - NODE_RADIUS };
}

// --- Interactions ---
function onNodeClick(badge) {
  emit('badge-click', badge);
}

function onNodeHover(badge, event) {
  hoveredBadge.value = badge;
  tooltipPos.value = { x: event.clientX, y: event.clientY };
}

function onNodeLeave() {
  hoveredBadge.value = null;
}

function isHighlighted(badge) {
  return props.highlightBadgeId && badge._id === props.highlightBadgeId;
}

function isEarned(badge) {
  return badge.active === true;
}

function nodeStroke(badge) {
  if (isHighlighted(badge)) return '#FFC107';
  if (badge.active !== undefined && !badge.active) return '#9E9E9E';
  return '#4CAF50';
}

function nodeOpacity(badge) {
  if (badge.active !== undefined && !badge.active) return 0.45;
  return 1;
}

function requirementsList(badge) {
  const reqs = [];
  if (badge.previousBadges?.length > 0) {
    reqs.push(`${t('project.previous_badges_label')} ${badge.previousBadges.join(', ')}`);
  }
  if (badge.checkinsAmount) {
    reqs.push(`${t('project.checkins_amount_label')} ${badge.checkinsAmount}`);
  }
  if (badge.mustContribute) {
    reqs.push(t('project.must_contribute_hint'));
  }
  if (badge.areaId && badge.areaId !== t('common.any')) {
    reqs.push(`${t('project.area_label')} ${badge.areaId}`);
  }
  if (badge.timeIntervalId && badge.timeIntervalId !== t('common.any')) {
    reqs.push(`${t('project.interval_label')} ${badge.timeIntervalId}`);
  }
  if (badge.taskType && badge.taskType !== t('common.any')) {
    reqs.push(`${t('project.type_label')} ${badge.taskType}`);
  }
  return reqs;
}
</script>

<template>
  <div class="badge-graph-wrapper">
    <div v-if="layoutData.nodes.length === 0" class="badge-graph-empty">
      <v-icon size="48" color="grey-lighten-1">mdi-trophy-outline</v-icon>
      <p>{{ $t('project.badge_graph_empty') }}</p>
    </div>
    <div v-else class="badge-graph-scroll">
      <svg
        :width="layoutData.width"
        :height="layoutData.height"
        class="badge-graph-svg"
      >
        <!-- Gradient defs -->
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#90A4AE" />
          </marker>
          <filter id="glow-earned">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-highlight">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Edges -->
        <path
          v-for="(edge, i) in layoutData.edges"
          :key="'edge-' + i"
          :d="edgePath(edge)"
          fill="none"
          stroke="#90A4AE"
          stroke-width="2"
          stroke-dasharray="6 3"
          marker-end="url(#arrowhead)"
          class="badge-graph-edge"
        />

        <!-- Nodes -->
        <g
          v-for="(node, index) in layoutData.nodes"
          :key="node._id || node.id || (node.name + '-' + index)"
          :transform="`translate(${node.x}, ${node.y})`"
          class="badge-graph-node"
          :class="{
            'badge-graph-node--clickable': !readonly,
            'badge-graph-node--highlighted': isHighlighted(node),
            'badge-graph-node--earned': isEarned(node),
          }"
          @click="onNodeClick(node)"
          @mouseenter="onNodeHover(node, $event)"
          @mouseleave="onNodeLeave"
        >
          <!-- Outer ring -->
          <circle
            :r="NODE_RADIUS + 3"
            :stroke="nodeStroke(node)"
            stroke-width="3"
            fill="none"
            :filter="isHighlighted(node) ? 'url(#glow-highlight)' : isEarned(node) ? 'url(#glow-earned)' : ''"
          />
          <!-- Badge image (clipped circle) -->
          <clipPath :id="'clip-' + node.name">
            <circle :r="NODE_RADIUS" />
          </clipPath>
          <image
            :href="node.imageUrl"
            :x="-NODE_RADIUS"
            :y="-NODE_RADIUS"
            :width="NODE_RADIUS * 2"
            :height="NODE_RADIUS * 2"
            :clip-path="`url(#clip-${node.name})`"
            :opacity="nodeOpacity(node)"
            preserveAspectRatio="xMidYMid slice"
          />
          <!-- Fallback circle if no image -->
          <circle
            v-if="!node.imageUrl"
            :r="NODE_RADIUS"
            :fill="isEarned(node) ? '#4CAF50' : '#BDBDBD'"
            :opacity="nodeOpacity(node)"
          />
          <!-- Earned checkmark -->
          <g v-if="isEarned(node)">
            <circle cx="20" cy="-20" r="10" fill="#4CAF50" />
            <text x="20" y="-16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">✓</text>
          </g>
          <!-- Badge name -->
          <text
            :y="NODE_RADIUS + 18"
            text-anchor="middle"
            class="badge-graph-label"
            :fill="nodeOpacity(node) < 1 ? '#9E9E9E' : '#333'"
          >
            {{ node.name.length > 14 ? node.name.slice(0, 12) + '…' : node.name }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Floating tooltip -->
    <Teleport to="body">
      <div
        v-if="hoveredBadge"
        class="badge-graph-tooltip"
        :style="{ left: tooltipPos.x + 16 + 'px', top: tooltipPos.y + 'px' }"
      >
        <div class="badge-graph-tooltip__header">
          <strong>{{ hoveredBadge.name }}</strong>
          <v-chip
            v-if="hoveredBadge.active !== undefined"
            :color="hoveredBadge.active ? 'success' : 'grey'"
            size="x-small"
            class="ml-2"
          >
            {{ hoveredBadge.active ? $t('project.badge_earned') : $t('project.badge_not_earned') }}
          </v-chip>
        </div>
        <p class="badge-graph-tooltip__desc">{{ hoveredBadge.description }}</p>
        <div v-if="requirementsList(hoveredBadge).length" class="badge-graph-tooltip__reqs">
          <strong>{{ $t('project.badge_requirements') }}</strong>
          <ul>
            <li v-for="(req, i) in requirementsList(hoveredBadge)" :key="i">{{ req }}</li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.badge-graph-wrapper {
  position: relative;
  width: 100%;
}

.badge-graph-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #9E9E9E;
}

.badge-graph-scroll {
  overflow-x: auto;
  padding: 8px 0;
}

.badge-graph-svg {
  display: block;
  margin: 0 auto;
}

.badge-graph-edge {
  transition: stroke 0.2s;
}

.badge-graph-node {
  cursor: default;
  transition: transform 0.2s;
}

.badge-graph-node--clickable {
  cursor: pointer;
}

.badge-graph-node--clickable:hover {
  filter: brightness(1.15);
}

.badge-graph-node--highlighted circle:first-child {
  animation: pulse-ring 1.8s ease-in-out infinite;
}

.badge-graph-label {
  font-size: 12px;
  font-weight: 500;
  font-family: 'Roboto', sans-serif;
}

@keyframes pulse-ring {
  0%, 100% { stroke-opacity: 1; }
  50% { stroke-opacity: 0.4; }
}
</style>

<style>
/* Tooltip styles (unscoped to work with Teleport) */
.badge-graph-tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(33, 33, 33, 0.95);
  color: #fff;
  border-radius: 10px;
  padding: 14px 18px;
  max-width: 280px;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  backdrop-filter: blur(8px);
  animation: tooltip-fade-in 0.15s ease-out;
}

@keyframes tooltip-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.badge-graph-tooltip__header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.badge-graph-tooltip__header strong {
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.badge-graph-tooltip__desc {
  margin: 0 0 8px;
  opacity: 0.85;
  font-size: 12px;
}

.badge-graph-tooltip__reqs {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 8px;
}

.badge-graph-tooltip__reqs strong {
  color: #fff;
  font-weight: 700;
}

.badge-graph-tooltip__reqs ul {
  margin: 4px 0 0;
  padding-left: 18px;
}

.badge-graph-tooltip__reqs li {
  margin-bottom: 2px;
  font-size: 11px;
  opacity: 0.9;
}
</style>
