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

  it('clears the persisted session', () => {
    localStorage.setItem('msg_login', '1');
    localStorage.setItem('token', 'token');
    localStorage.setItem('username', 'user');
    localStorage.setItem('user_id', '1');
    localStorage.setItem('complete_name', 'User Name');
    localStorage.setItem('profile_image', 'image.png');
    localStorage.setItem('role', 'Volunteer');
    localStorage.setItem('badges', '[]');
    localStorage.setItem('points', '10');

    AuthService.clearSession();

    expect(localStorage.getItem('msg_login')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('user_id')).toBeNull();
    expect(localStorage.getItem('complete_name')).toBeNull();
    expect(localStorage.getItem('profile_image')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('badges')).toBeNull();
    expect(localStorage.getItem('points')).toBeNull();
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
