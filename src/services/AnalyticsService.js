import RayuelaService from "@/services/RayuelaService";

class AnalyticsService extends RayuelaService {
  getCheckinsOverTime({ projectId, granularity, startDate, endDate } = {}) {
    return this.get(`/analytics/checkins-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })}`);
  }

  getActiveUsersOverTime({ projectId, granularity, startDate, endDate } = {}) {
    return this.get(`/analytics/active-users-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })}`);
  }

  getByStrategy() {
    return this.get(`/analytics/by-strategy`);
  }

  getPointsOverTime({ projectId, granularity, startDate, endDate } = {}) {
    return this.get(`/analytics/points-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })}`);
  }

  getContributionRate({ projectId } = {}) {
    return this.get(`/analytics/contribution-rate?${new URLSearchParams({
      ...(projectId && { projectId }),
    })}`);
  }

  getBadgeAcquisitionOverTime({ projectId, granularity, startDate, endDate } = {}) {
    return this.get(`/analytics/badge-acquisition-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })}`);
  }

  getSummary({ projectId, startDate, endDate } = {}) {
    return this.get(`/analytics/summary?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    })}`);
  }

  getCommunityStats(projectId, query = {}) {
    const cleanQuery = {};
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) {
        cleanQuery[key] = val;
      }
    }
    const params = new URLSearchParams(cleanQuery).toString();
    const url = `/analytics/project/${projectId}/community-stats${params ? '?' + params : ''}`;
    return this.get(url);
  }
}

export default new AnalyticsService();
