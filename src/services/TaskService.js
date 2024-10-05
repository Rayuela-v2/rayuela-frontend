import axios from "axios";
import RayuelaService from "@/services/RayuelaService";

class TaskService extends RayuelaService {
    getTaskForProject(projectId) {
        return axios.get(this.baseUrl + `/task/project/${projectId}`, this.getHeaders())
            .then((response) => response.data);
    }

}

export default new TaskService(); // Sinleton pattern
