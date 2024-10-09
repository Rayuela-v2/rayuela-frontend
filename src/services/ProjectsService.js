import RayuelaService from "@/services/RayuelaService";

class ProjectsService extends RayuelaService {
    getProjects() {
        return this.get(`/projects/`)
            .then((response) => response.data);
    }

    async getDiffProjects() {
        return this.get(`/projects/`)
            .then(data => data)
    }

    async toggleAvailability(projectId) {
        return this.post(`/projects/availability/${projectId}`, null)
            .then(data => data)
    }

    async getProjectById(projectId) {
        return this.get(`/projects/${projectId}`)
            .then(data => data);
    }

    async getAdminProjects() {
        return this.get(`/projects/`)
            .then((data) => data.filter(p => p.ownerId === localStorage.getItem("user_id")));
    }

    async createProject(project) {
        return this.post('/projects', project);
    }

    async updateProject(project) {
        return this.patch(`/projects/${project._id}`, project);
    }
}

export default new ProjectsService(); // Sinleton pattern
