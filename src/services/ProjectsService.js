import axios from "axios";
import RayuelaService from "@/services/RayuelaService";

class ProjectsService extends RayuelaService {
    getProjects() {
        return axios.get(this.baseUrl + `/projects/`, this.getHeaders())
            .then((response) => response.data);
    }

    async getDiffProjects() {
        return axios.get(this.baseUrl + `/projects/`, this.getHeaders())
            .then(res => res.data)
    }

    async toggleAvailability(projectId) {
        return axios.post(this.baseUrl + `/projects/availability/${projectId}`, null, this.getHeaders())
            .then(res => res.data)
    }

    async getProjectById(projectId) {
        return axios.get(this.baseUrl + `/projects/${projectId}`, this.getHeaders())
            .then(res => res.data);
    }

    async getAdminProjects() {
        return axios.get(this.baseUrl + `/projects/`, this.getHeaders())
            .then((response) => response.data.filter(p => p.ownerId === localStorage.getItem("user_id")));
    }
}

export default new ProjectsService(); // Sinleton pattern
