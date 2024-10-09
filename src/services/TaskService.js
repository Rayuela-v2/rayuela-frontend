import RayuelaService from "@/services/RayuelaService";

class TaskService extends RayuelaService {
    getTaskForProject(projectId) {
        return this.get(`/task/project/${projectId}`);
    }

    async bulkSave(tasks, projectId) {
        return this.post(`/task/project/${projectId}/bulk`, tasks);
    }
}

export default new TaskService(); // Sinleton pattern
