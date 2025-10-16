import axios from "axios";
import router from "@/router";
import {loadingService} from "@/services/loadingService.js";

export default class RayuelaService {
    baseUrl = import.meta.env.VITE_ROOT_API;

    getHeaders() {
        const token = localStorage.getItem("token")
        return {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }
    }

    post(url, body) {
        loadingService.show();
        return axios.post(this.baseUrl + url, body, this.getHeaders())
            .then(res => {
                if (res.status === 401) {
                    localStorage.clear();
                    router.push("/login")
                }
                return res.data;
            }).finally(() => loadingService.hide())
    }

    delete(url) {
        loadingService.show();
        return axios.delete(this.baseUrl + url, this.getHeaders())
            .then(res => {
                if (res.status === 401) {
                    localStorage.clear();
                    router.push("/login")
                }
                return res.data;
            }).finally(() => loadingService.hide())
    }

    patch(url, body) {
        loadingService.show();
        return axios.patch(this.baseUrl + url, body, this.getHeaders())
            .then(res => {
                if (res.status === 401) {
                    localStorage.clear();
                    router.push("/login")
                }
                return res.data;
            }).finally(() => loadingService.hide())
    }

    get(path) {
        loadingService.show();
        return axios.get(this.baseUrl + path, this.getHeaders())
            .then(res => res.data)
            .catch(err => {
                if (err.response.status === 401) {
                    localStorage.clear();
                    router.push("/login");
                }
                return err.data;
            }).finally(() => loadingService.hide())
    }
}
