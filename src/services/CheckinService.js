import RayuelaService from "@/services/RayuelaService";

class CheckinService extends RayuelaService {
    getByProject(projectId) {
        return this.get(`/checkin/user/${projectId}`);
    }

    /**
     * Admin-only: paginated, filterable list of every checkin for a project.
     * `params` is a plain object — undefined / empty values are dropped so
     * the URL stays clean.
     *
     * Supported keys: taskName, taskType, hasPhotos ('true'|'false'),
     * contributed ('true'|'false'), userId, latitude, longitude, radiusKm,
     * dateFrom, dateTo, page, limit, sortOrder ('asc'|'desc').
     */
    getForAdmin(projectId, params = {}) {
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null || value === '') continue;
            search.append(key, String(value));
        }
        const qs = search.toString();
        return this.get(`/checkin/admin/project/${projectId}${qs ? `?${qs}` : ''}`);
    }
}

export default new CheckinService(); // Sinleton pattern
