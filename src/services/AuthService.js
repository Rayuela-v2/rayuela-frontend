import axios from "axios";
import RayuelaService from "@/services/RayuelaService";

class AuthService extends RayuelaService {
    loginWithPw(user) {
        return axios.post(this.baseUrl + "/auth/login/", user)
            .then((response) => {
                localStorage.setItem("msg_login", "1")
                localStorage.setItem("token", response.data.access_token)
                localStorage.setItem("username", user.username)
                return response.data;
            })
    }

    register(user) {
        return axios.post(this.baseUrl + "/auth/register/", user)
    }

    getUser() {
        return axios.get(this.baseUrl + "/user", this.getHeaders())
            .then(res => {
                localStorage.setItem("complete_name", res.data.complete_name)
                localStorage.setItem("profile_image", res.data.profile_image)
                localStorage.setItem("role", res.data.role)
                return res.data
            })
    }
}

export default new AuthService(); // Sinleton pattern
