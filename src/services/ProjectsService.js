import axios from "axios";
import RayuelaService from "@/services/RayuelaService";

class ProjectsService extends RayuelaService{
    getProjects() {
        return axios.get(this.baseUrl + `/projects/`, this.getHeaders())
            .then((response) => response.data);
    }

    async getDiffProjects() {
        return axios.get(this.baseUrl + `/projects/`, this.getHeaders())
            .then(res => res.data)
    }

    async delete(projectId) {
        return axios.delete(this.baseUrl + `/projects/${projectId}`, this.getHeaders())
            .then(res => res.data)
    }

    async getProjectById(projectId) {
        return axios.get(this.baseUrl + `/projects/${projectId}`, this.getHeaders())
            .then(res => res.data);
    }
}

export default new ProjectsService(); // Sinleton pattern
