import RayuelaService from "@/services/RayuelaService";

class AuthService extends RayuelaService {
    loginWithPw(user) {
        return this.post("/auth/login/", user)
            .then((data) => {
                localStorage.setItem("msg_login", "1")
                localStorage.setItem("token", data.access_token)
                localStorage.setItem("username", user.username)
                return data;
            });
    }

    register(user) {
        return this.post("/auth/register/", user);
    }

    getUser() {
        return this.get('/user')
            .then(data => {
                localStorage.setItem("user_id", data._id)
                localStorage.setItem("complete_name", data._complete_name)
                localStorage.setItem("profile_image", data._profile_image)
                localStorage.setItem("role", data._role)
                localStorage.setItem("badges", data._badges)
                localStorage.setItem("points", data._points)
                return data
            }).catch(() => {
                console.log('Unable to get user')
            })
    }
}

export default new AuthService(); // Sinleton pattern
