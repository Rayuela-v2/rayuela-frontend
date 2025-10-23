import RayuelaService from "@/services/RayuelaService";

class ProjectsService extends RayuelaService {

    async getPublicrojects() {
        return this.get(`/volunteer/public/projects/`).then((r) => r.filter(p => p.available))
    }

    async getProjects() {
        if (localStorage.getItem('role') !== 'Admin') {
            return this.get(`/volunteer/projects/`).then((r) => r.filter(p => p.available))
        }
    }

    async getDiffProjects() {
        return this.get(`/projects/`)
            .then(response => response.data)
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
        return this.patch(`/projects/${project.id}`, project);
    }

    async toggleSubscription(projectId) {
        return this.post('/volunteer/subscription/' + projectId);
    }

    async getPublicProjectById(projectId) {
        return this.get(`/projects/public/${projectId}`);
    }
}

export default new ProjectsService(); // Sinleton pattern
