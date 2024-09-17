export default class RayuelaService {
    getHeaders() {
        const token = localStorage.getItem("token")
        return {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }
    }
}
