import RayuelaService from "@/services/RayuelaService";

class BadgesService extends RayuelaService {

    async deleteBadge(item) {
        return new Promise(item);
    }

    async getBadges(projectId) {
        return this.get('/badges/project/' + projectId);
    }

    async updateBadge(badge) {
        return this.patch('/badges/' + badge._id, badge);
    }

    async createBadge(badge) {
        return this.post('/badges', badge);
    }

    async getBadgeById(badgeId) {
        return this.get(`/badges/${badgeId}`);
    }
}

export default new BadgesService(); // Sinleton pattern
