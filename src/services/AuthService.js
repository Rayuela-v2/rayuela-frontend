import RayuelaService from "@/services/RayuelaService";

class AuthService extends RayuelaService {
    clearSession() {
        [
            "msg_login",
            "token",
            "username",
            "user_id",
            "complete_name",
            "profile_image",
            "role",
            "badges",
            "points",
        ].forEach((key) => localStorage.removeItem(key));
    }

    persistSession(data) {
        localStorage.setItem("msg_login", "1");
        localStorage.setItem("token", data.access_token);
        if (data.username) {
            localStorage.setItem("username", data.username);
        }
        return data;
    }

    loginWithPw(user) {
        return this.post("/auth/login", user)
            .then((data) => this.persistSession(data));
    }

    loginWithGoogle(credential, extraData = {}) {
        return this.post("/auth/google", { credential, ...extraData })
            .then((data) => this.persistSession(data));
    }

    register(user) {
        return this.post("/auth/register", user);
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
            })
    }

    async sendResetPasswordEmail(email) {
        return this.post("/auth/forgot-password", {email})
    }

    async recoverPassword(token, newPassword) {
        return this.post("/auth/recover-password", {token, newPassword})
    }

    async verifyUser(token) {
        return this.post("/auth/verify-email", {token})
    }
}

export default new AuthService(); // Sinleton pattern
