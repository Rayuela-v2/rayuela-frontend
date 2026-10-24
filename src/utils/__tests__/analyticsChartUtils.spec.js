import { describe, it, expect } from 'vitest';
import {
  fillTimeSeries,
  getStrategyColor,
  getStrategyLabel,
  normalizeBucketKey,
} from '../analyticsChartUtils';

describe('analyticsChartUtils', () => {
  describe('normalizeBucketKey', () => {
    it('normalizes ISO timestamps and YYYY-MM-DD strings to YYYY-MM-DD in UTC', () => {
      expect(normalizeBucketKey('2026-10-19T00:00:00.000Z', 'day')).toBe('2026-10-19');
      expect(normalizeBucketKey('2026-10-19', 'day')).toBe('2026-10-19');
      expect(normalizeBucketKey('2026-10-01', 'month')).toBe('2026-10-01');
    });
  });

  describe('fillTimeSeries - day granularity', () => {
    it('fills missing days with 0 from startDate up to endDate', () => {
      const raw = [
        { period: '2026-10-19', count: 1 },
        { period: '2026-10-21', count: 2 },
      ];
      const filled = fillTimeSeries(raw, 'count', 'day', '2026-10-18', '2026-10-24');

      expect(filled).toEqual([
        { period: '2026-10-18', count: 0 },
        { period: '2026-10-19', count: 1 },
        { period: '2026-10-20', count: 0 },
        { period: '2026-10-21', count: 2 },
        { period: '2026-10-22', count: 0 },
        { period: '2026-10-23', count: 0 },
        { period: '2026-10-24', count: 0 },
      ]);
    });

    it('returns all-zero series across range when raw is empty', () => {
      const filled = fillTimeSeries([], 'count', 'day', '2026-10-22', '2026-10-24');
      expect(filled).toEqual([
        { period: '2026-10-22', count: 0 },
        { period: '2026-10-23', count: 0 },
        { period: '2026-10-24', count: 0 },
      ]);
    });
  });

  describe('fillTimeSeries - week granularity', () => {
    it('aligns buckets to ISO Mondays and fills missing weeks through endDate', () => {
      const raw = [
        { period: '2026-09-28T00:00:00.000Z', count: 5 },
        { period: '2026-10-12T00:00:00.000Z', count: 10 },
      ];
      const filled = fillTimeSeries(raw, 'count', 'week', '2026-09-25', '2026-10-24');

      expect(filled).toEqual([
        { period: '2026-09-21', count: 0 },
        { period: '2026-09-28', count: 5 },
        { period: '2026-10-05', count: 0 },
        { period: '2026-10-12', count: 10 },
        { period: '2026-10-19', count: 0 },
      ]);
    });
  });

  describe('fillTimeSeries - month granularity', () => {
    it('aligns buckets to YYYY-MM-01 and fills missing months', () => {
      const raw = [{ period: '2026-08-01', totalPoints: 120 }];
      const filled = fillTimeSeries(raw, 'totalPoints', 'month', '2026-08-10', '2026-10-24');

      expect(filled).toEqual([
        { period: '2026-08-01', totalPoints: 120 },
        { period: '2026-09-01', totalPoints: 0 },
        { period: '2026-10-01', totalPoints: 0 },
      ]);
    });
  });

  describe('strategy helpers', () => {
    it('maps SIN ADAPTACION, ELASTICA, and DESVANECIMIENTO to distinct colors and translated labels', () => {
      const t = (key) => ({
        'admin.adaptation_option_none': 'Sin adaptación',
        'admin.adaptation_option_elastic': 'Adaptación elástica de puntos',
        'admin.adaptation_option_fading': 'Desvanecimiento de insignias',
      }[key] || key);

      expect(getStrategyColor('SIN ADAPTACION')).toBe('#1976D2');
      expect(getStrategyColor('ELASTICA')).toBe('#F57C00');
      expect(getStrategyColor('DESVANECIMIENTO')).toBe('#7B1FA2');

      expect(getStrategyLabel('DESVANECIMIENTO', t)).toBe('Desvanecimiento de insignias');
      expect(getStrategyLabel('SIN ADAPTACION', t)).toBe('Sin adaptación');
    });
  });
});
