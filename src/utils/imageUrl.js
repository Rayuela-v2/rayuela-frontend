/**
 * Resolves an image reference or key to a fully-qualified URL for display.
 * - If the key starts with 'http://' or 'https://', it returns it untouched (legacy compatibility).
 * - If the key starts with 'data:image/', it returns it untouched (in-memory previews).
 * - If the key is a relative storage key (e.g. 'badges/xyz.jpg' or 'projects/123/cover.jpg'),
 *   it formats it as `${VITE_ROOT_API}/storage/file?key=${encodeURIComponent(key)}`.
 *
 * @param {string|null|undefined} key
 * @returns {string} Fully-qualified image URL or empty string
 */
export function getImageUrl(key) {
    if (!key) return '';
    const trimmed = String(key).trim();
    if (!trimmed) return '';

    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }

    const cleanKey = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
    const baseUrl = import.meta.env.VITE_ROOT_API || 'http://localhost:3000/v1';
    return `${baseUrl}/storage/file?key=${encodeURIComponent(cleanKey)}`;
}

export default getImageUrl;
