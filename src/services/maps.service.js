import axios from 'axios';
import { OSM } from 'ol/source';

export const DEFAULT_MAP_CONFIG = Object.freeze({
  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: [],
  attributionText: '© OpenStreetMap contributors',
  attributionUrl: 'https://www.openstreetmap.org/copyright',
  fixMapUrl: 'https://www.openstreetmap.org/fixthemap',
  minZoom: 2,
  maxZoom: 19,
  userAgent: 'RayuelaMobile/1.0 (+https://github.com/Rayuela-v2)',
  cacheMaxAgeDays: 14,
  allowBulkPrefetch: false,
});

let cachedMapConfig = null;
let inflightPromise = null;

function buildAttributionsHtml(config = DEFAULT_MAP_CONFIG) {
  const text = config.attributionText || DEFAULT_MAP_CONFIG.attributionText;
  const copyrightUrl =
    config.attributionUrl || DEFAULT_MAP_CONFIG.attributionUrl;
  const fixUrl = config.fixMapUrl || DEFAULT_MAP_CONFIG.fixMapUrl;

  const links = [`<a href="${copyrightUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`];
  if (fixUrl) {
    links.push(
      `<a href="${fixUrl}" target="_blank" rel="noopener noreferrer">Fix the map</a>`,
    );
  }
  return links.join(' · ');
}

/**
 * Returns the currently cached map config or the compliant OSM default
 * synchronously so OpenLayers maps can mount immediately.
 */
export function getCachedMapConfig() {
  return cachedMapConfig || DEFAULT_MAP_CONFIG;
}

/**
 * Fetches `/v1/maps/config` from `rayuela-NodeBackend`, caches it in memory,
 * and falls back to `DEFAULT_MAP_CONFIG` if unreachable.
 */
export async function fetchMapConfig({ force = false } = {}) {
  if (!force && cachedMapConfig) {
    return cachedMapConfig;
  }
  if (!force && inflightPromise) {
    return inflightPromise;
  }

  const baseUrl = import.meta.env.VITE_ROOT_API || '';
  inflightPromise = axios
    .get(`${baseUrl}/maps/config`)
    .then((res) => {
      if (res?.data && typeof res.data === 'object' && res.data.urlTemplate) {
        cachedMapConfig = {
          ...DEFAULT_MAP_CONFIG,
          ...res.data,
        };
      } else {
        cachedMapConfig = { ...DEFAULT_MAP_CONFIG };
      }
      return cachedMapConfig;
    })
    .catch(() => {
      cachedMapConfig = cachedMapConfig || { ...DEFAULT_MAP_CONFIG };
      return cachedMapConfig;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

/**
 * Creates an OpenLayers `OSM` tile source configured with the centralized
 * provider URL template, zoom cap, and licence attribution.
 */
export function createMapTileSource(config = getCachedMapConfig()) {
  const effective = {
    ...DEFAULT_MAP_CONFIG,
    ...(config || {}),
  };

  const source = new OSM({
    url: effective.urlTemplate,
    maxZoom: effective.maxZoom,
    attributions: buildAttributionsHtml(effective),
    crossOrigin: 'anonymous',
  });

  // If the config hasn't been fetched from backend yet, refresh in background
  // and update the tile URL if the backend configured a different provider.
  if (!cachedMapConfig) {
    fetchMapConfig().then((remoteConfig) => {
      if (
        remoteConfig &&
        remoteConfig.urlTemplate !== effective.urlTemplate &&
        typeof source.setUrl === 'function'
      ) {
        source.setUrl(remoteConfig.urlTemplate);
      }
      if (
        remoteConfig &&
        typeof source.setAttributions === 'function'
      ) {
        source.setAttributions(buildAttributionsHtml(remoteConfig));
      }
    });
  }

  return source;
}

export function resetMapConfigCacheForTests() {
  cachedMapConfig = null;
  inflightPromise = null;
}
