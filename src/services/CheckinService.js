import RayuelaService from "@/services/RayuelaService";

class CheckinService extends RayuelaService {
    getByProject(projectId) {
        return this.get(`/checkin/user/${projectId}`);
    }
}

export default new CheckinService(); // Sinleton pattern
