export const STRATEGY_METADATA = {
  'SIN ADAPTACION': {
    color: '#1976D2',
    i18nKey: 'admin.adaptation_option_none',
  },
  ELASTICA: {
    color: '#F57C00',
    i18nKey: 'admin.adaptation_option_elastic',
  },
  DESVANECIMIENTO: {
    color: '#7B1FA2',
    i18nKey: 'admin.adaptation_option_fading',
  },
};

export function getStrategyColor(strategy) {
  return STRATEGY_METADATA[strategy]?.color || '#607D8B';
}

export function getStrategyLabel(strategy, t) {
  const meta = STRATEGY_METADATA[strategy];
  if (meta && typeof t === 'function') {
    return t(meta.i18nKey);
  }
  return strategy || '';
}

function parseUtcDate(input) {
  if (!input) return null;
  if (input instanceof Date) {
    return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
  }
  const str = String(input).slice(0, 10);
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcBucket(date, granularity) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (granularity === 'week') {
    const day = d.getUTCDay(); // 0 (Sun) .. 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diffToMonday);
    return d;
  }
  if (granularity === 'month') {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }
  return d;
}

function stepUtcBucket(date, granularity) {
  if (granularity === 'week') {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 7));
  }
  if (granularity === 'month') {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
}

export function normalizeBucketKey(periodInput, granularity = 'day') {
  const parsed = parseUtcDate(periodInput);
  if (!parsed) return String(periodInput);
  return formatUtcDate(startOfUtcBucket(parsed, granularity));
}

/**
 * Fills missing time buckets with 0 across [startDate, endDate].
 * When startDate/endDate are omitted ("All time" mode), derives the start from
 * the earliest data point in `raw` and the end from `todayUtc` (or latest point).
 */
export function fillTimeSeries(
  raw = [],
  valueKey = 'count',
  granularity = 'week',
  startDate,
  endDate,
  todayUtc = new Date(),
) {
  const valueByBucket = new Map();
  let minRawDate = null;
  let maxRawDate = null;

  for (const item of raw) {
    if (!item || !item.period) continue;
    const d = parseUtcDate(item.period);
    if (!d) continue;
    const bucketDate = startOfUtcBucket(d, granularity);
    const key = formatUtcDate(bucketDate);
    valueByBucket.set(key, Number(item[valueKey] ?? 0));
    if (!minRawDate || bucketDate < minRawDate) minRawDate = bucketDate;
    if (!maxRawDate || bucketDate > maxRawDate) maxRawDate = bucketDate;
  }

  const parsedStart = parseUtcDate(startDate) || minRawDate;
  const parsedEnd = parseUtcDate(endDate) || (minRawDate ? parseUtcDate(todayUtc) : null);

  if (!parsedStart || !parsedEnd) {
    return [];
  }

  let cursor = startOfUtcBucket(parsedStart, granularity);
  const lastBucket = startOfUtcBucket(
    maxRawDate && maxRawDate > parsedEnd ? maxRawDate : parsedEnd,
    granularity,
  );

  const result = [];
  while (cursor <= lastBucket) {
    const key = formatUtcDate(cursor);
    result.push({
      period: key,
      [valueKey]: valueByBucket.get(key) ?? 0,
    });
    cursor = stepUtcBucket(cursor, granularity);
  }

  return result;
}
