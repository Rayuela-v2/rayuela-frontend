import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/RayuelaService', () => ({
  default: class RayuelaService {
    post() {
      return Promise.resolve();
    }
  },
}));

let AuthService;

describe('AuthService', () => {
  beforeAll(async () => {
    ({ default: AuthService } = await import('../AuthService'));
  });

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('stores the session after password login', async () => {
    const response = { access_token: 'pw-token', username: 'rayuela-user' };
    const postSpy = vi.spyOn(AuthService, 'post').mockResolvedValue(response);

    const result = await AuthService.loginWithPw({
      username: 'rayuela-user',
      password: 'secret',
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      username: 'rayuela-user',
      password: 'secret',
    });
    expect(result).toEqual(response);
    expect(localStorage.getItem('token')).toBe('pw-token');
    expect(localStorage.getItem('username')).toBe('rayuela-user');
    expect(localStorage.getItem('msg_login')).toBe('1');
  });

  it('stores the session after Google login', async () => {
    const response = {
      access_token: 'google-token',
      username: 'google-user',
      isNewUser: true,
    };
    const postSpy = vi.spyOn(AuthService, 'post').mockResolvedValue(response);

    const result = await AuthService.loginWithGoogle('google-credential', {
      username: 'chosen-user',
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/google', {
      credential: 'google-credential',
      username: 'chosen-user',
    });
    expect(result).toEqual(response);
    expect(localStorage.getItem('token')).toBe('google-token');
    expect(localStorage.getItem('username')).toBe('google-user');
    expect(localStorage.getItem('msg_login')).toBe('1');
  });

  it('sends extra signup data during Google login when provided', async () => {
    const response = { access_token: 'google-token', username: 'chosen-user' };
    const postSpy = vi.spyOn(AuthService, 'post').mockResolvedValue(response);

    await AuthService.loginWithGoogle('google-credential', {
      username: 'chosen-user',
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/google', {
      credential: 'google-credential',
      username: 'chosen-user',
    });
  });
});
