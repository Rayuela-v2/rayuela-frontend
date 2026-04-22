import RayuelaService from "@/services/RayuelaService";

class AnalyticsService extends RayuelaService {
  getCheckinsOverTime({ projectId, granularity } = {}) {
    return this.get(`/analytics/checkins-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
    })}`);
  }

  getActiveUsersOverTime({ projectId, granularity } = {}) {
    return this.get(`/analytics/active-users-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
    })}`);
  }

  getByStrategy() {
    return this.get(`/analytics/by-strategy`);
  }

  getPointsOverTime({ projectId, granularity } = {}) {
    return this.get(`/analytics/points-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
    })}`);
  }

  getContributionRate({ projectId } = {}) {
    return this.get(`/analytics/contribution-rate?${new URLSearchParams({
      ...(projectId && { projectId }),
    })}`);
  }

  getBadgeAcquisitionOverTime({ projectId, granularity } = {}) {
    return this.get(`/analytics/badge-acquisition-over-time?${new URLSearchParams({
      ...(projectId && { projectId }),
      ...(granularity && { granularity }),
    })}`);
  }

  getSummary({ projectId } = {}) {
    return this.get(`/analytics/summary?${new URLSearchParams({
      ...(projectId && { projectId }),
    })}`);
  }
}

export default new AnalyticsService();
