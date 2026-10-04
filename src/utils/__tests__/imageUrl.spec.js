import { describe, it, expect } from 'vitest';
import { getImageUrl } from '@/utils/imageUrl';

describe('imageUrl utility', () => {
    it('returns empty string for null, undefined, or empty key', () => {
        expect(getImageUrl(null)).toBe('');
        expect(getImageUrl(undefined)).toBe('');
        expect(getImageUrl('')).toBe('');
        expect(getImageUrl('   ')).toBe('');
    });

    it('passes through external http and https URLs unchanged', () => {
        expect(getImageUrl('http://example.com/logo.png')).toBe('http://example.com/logo.png');
        expect(getImageUrl('https://images.unsplash.com/photo-123')).toBe('https://images.unsplash.com/photo-123');
    });

    it('passes through data URIs and blob URLs unchanged', () => {
        expect(getImageUrl('data:image/png;base64,abc123==')).toBe('data:image/png;base64,abc123==');
        expect(getImageUrl('blob:http://localhost:5173/uuid-blob')).toBe('blob:http://localhost:5173/uuid-blob');
    });

    it('resolves relative storage keys to the backend storage endpoint', () => {
        const result = getImageUrl('badges/unique-id.jpg');
        expect(result).toContain('/storage/file?key=badges%2Funique-id.jpg');
    });

    it('strips leading slashes from storage keys', () => {
        const result = getImageUrl('/projects/proj-1/cover.jpg');
        expect(result).toContain('/storage/file?key=projects%2Fproj-1%2Fcover.jpg');
        expect(result).not.toContain('key=%2F');
    });
});
