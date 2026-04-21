import { describe, expect, it } from 'vitest';
import { getGoogleLocale } from '../googleAuth';

describe('googleAuth', () => {
  it('maps app locales to Google locales', () => {
    expect(getGoogleLocale('ES')).toBe('es');
    expect(getGoogleLocale('EN')).toBe('en');
    expect(getGoogleLocale('PT')).toBe('pt-BR');
  });

  it('falls back to english for unknown locales', () => {
    expect(getGoogleLocale('DE')).toBe('en');
  });
});
