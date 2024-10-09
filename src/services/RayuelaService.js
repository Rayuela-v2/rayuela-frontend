import axios from "axios";
import router from "@/router";

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
        return axios.post(this.baseUrl + url, body, this.getHeaders())
            .then( res => {
                if(res.status === 401) {
                    localStorage.clear();
                    router.push("/login")
                }
                return res.data;
            })
    }

    patch(url, body) {
        return axios.patch(this.baseUrl + url, body, this.getHeaders())
            .then( res => {
                if(res.status === 401) {
                    localStorage.clear();
                    router.push("/login")
                }
                return res.data;
            })
    }

    get(path) {
        return axios.get(this.baseUrl + path, this.getHeaders())
            .then(res => res.data)
            .catch( err => {
                if(err.response.status === 401) {
                    localStorage.clear();
                    router.push("/login");
                }
                return err.data;
            })
    }
}
