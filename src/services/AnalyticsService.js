import axios from 'axios';

const BASE = `${import.meta.env.VITE_ROOT_API}/analytics`;

function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function getCheckinsOverTime(token, { projectId, granularity } = {}) {
  return axios.get(`${BASE}/checkins-over-time`, {
    ...authHeader(token),
    params: { projectId, granularity },
  });
}

export function getActiveUsersOverTime(token, { projectId, granularity } = {}) {
  return axios.get(`${BASE}/active-users-over-time`, {
    ...authHeader(token),
    params: { projectId, granularity },
  });
}

export function getByStrategy(token) {
  return axios.get(`${BASE}/by-strategy`, authHeader(token));
}

export function getPointsOverTime(token, { projectId, granularity } = {}) {
  return axios.get(`${BASE}/points-over-time`, {
    ...authHeader(token),
    params: { projectId, granularity },
  });
}

export function getContributionRate(token, { projectId } = {}) {
  return axios.get(`${BASE}/contribution-rate`, {
    ...authHeader(token),
    params: { projectId },
  });
}

export function getBadgeAcquisitionOverTime(token, { projectId, granularity } = {}) {
  return axios.get(`${BASE}/badge-acquisition-over-time`, {
    ...authHeader(token),
    params: { projectId, granularity },
  });
}

export function getSummary(token) {
  return axios.get(`${BASE}/summary`, authHeader(token));
}
