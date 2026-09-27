import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BadgeInterestTimeseriesChart from '../BadgeInterestTimeseriesChart.vue';

const mockTimeline = {
  projectId: 'proj1',
  threshold: 0.2,
  startDate: '2026-06-01T00:00:00.000Z',
  endDate: '2026-06-05T00:00:00.000Z',
  stepDays: 1,
  timestamps: [
    '2026-06-01T00:00:00.000Z',
    '2026-06-02T00:00:00.000Z',
    '2026-06-03T00:00:00.000Z',
    '2026-06-04T00:00:00.000Z',
    '2026-06-05T00:00:00.000Z',
  ],
  series: [
    {
      badgeId: 'b1',
      badgeName: 'Mapeador Inicial',
      status: 'active',
      points: [0.5, 0.35, 0.25, 0.18, 0.14],
      isCandidate: true,
      isLowestCII: true,
      currentCII: 0.14,
    },
    {
      badgeId: 'b2',
      badgeName: 'Experto',
      status: 'active',
      points: [null, 0.8, 0.7, 0.6, 0.55],
      isCandidate: true,
      isLowestCII: false,
      currentCII: 0.55,
    },
  ],
};

const globalMocks = {
  mocks: {
    $t: (key, params) => {
      if (params?.threshold !== undefined) return `Límite (${params.threshold})`;
      return key;
    },
  },
};

describe('BadgeInterestTimeseriesChart.vue', () => {
  it('renders empty state when timeline is null or empty', () => {
    const wrapper = mount(BadgeInterestTimeseriesChart, {
      props: { timeline: null },
      global: globalMocks,
    });
    expect(wrapper.find('.chart-empty').exists()).toBe(true);
    expect(wrapper.find('svg.timeseries-svg').exists()).toBe(false);
  });

  it('renders SVG lines, threshold line, and data dots when timeline data is provided', () => {
    const wrapper = mount(BadgeInterestTimeseriesChart, {
      props: { timeline: mockTimeline },
      global: globalMocks,
    });

    expect(wrapper.find('svg.timeseries-svg').exists()).toBe(true);
    // Threshold line
    const thresholdLine = wrapper.find('.threshold-line-group line');
    expect(thresholdLine.exists()).toBe(true);

    // Series paths
    const seriesPaths = wrapper.findAll('.series-path');
    expect(seriesPaths.length).toBe(2);

    // Data dots
    const dots = wrapper.findAll('.data-dot');
    // b1 has 5 non-null points, b2 has 4 non-null points -> 9 dots total
    expect(dots.length).toBe(9);
  });

  it('handles null values by skipping null points in SVG path', () => {
    const wrapper = mount(BadgeInterestTimeseriesChart, {
      props: { timeline: mockTimeline },
      global: globalMocks,
    });

    const seriesPaths = wrapper.findAll('.series-path');
    // b2 starts with null, so path should start with the second coordinate
    const b2Path = seriesPaths[1].attributes('d');
    expect(b2Path).not.toContain('NaN');
    expect(b2Path.startsWith('M')).toBe(true);
  });

  it('emits select-badge when clicking on a badge series or legend item', async () => {
    const wrapper = mount(BadgeInterestTimeseriesChart, {
      props: { timeline: mockTimeline },
      global: globalMocks,
    });

    const items = wrapper.findAll('.legend-item');
    expect(items.length).toBe(2);

    await items[0].trigger('click');
    expect(wrapper.emitted('select-badge')).toBeTruthy();
    expect(wrapper.emitted('select-badge')[0]).toEqual(['b1']);
  });
});
