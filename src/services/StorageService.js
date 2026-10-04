import RayuelaService from "@/services/RayuelaService";

class StorageService extends RayuelaService {
    /**
     * Upload an image to internal storage via the backend upload endpoint.
     * @param {File} file
     * @param {string} folder - 'badges' or 'projects'
     * @returns {Promise<{ key: string, url: string }>}
     */
    async uploadFile(file, folder = 'badges') {
        const formData = new FormData();
        formData.append('file', file);
        return this.post(`/storage/upload?folder=${encodeURIComponent(folder)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

export default new StorageService();
