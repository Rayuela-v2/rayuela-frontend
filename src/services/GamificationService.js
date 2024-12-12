import RayuelaService from "@/services/RayuelaService";
import {store} from "@/vuex/state";

class GamificationService extends RayuelaService {

    async deleteBadge(id) {
        return this.delete(`/gamification/${store.state.project._id}/badge/${id}`);
    }

    async getGamification(projectId) {
        return this.get('/gamification/' + projectId);
    }

    async update(badge) {
        return this.patch('/gamification/badge/' + badge._id, badge);
    }

    async createBadge(badge) {
        return this.post('/gamification/badge', { projectId: store.state.project._id, ...badge });
    }

    async getBadgeById(badgeId) {
        return this.get(`/gamification/${badgeId}`);
    }

    async createScoreRule(body) {
        return this.post('/gamification/score-rule', body);
    }

    async updateScoreRule(body) {
        return this.patch('/gamification/score-rule', body);
    }

    async deleteScoreRule(id) {
        return this.delete(`/gamification/${store.state.project._id}/score-rule/${id}`);
    }

    getLeaderboardFor(projectId) {
        return this.get(`/leaderboard/${projectId}`);
    }
}

export default new GamificationService(); // Sinleton pattern
