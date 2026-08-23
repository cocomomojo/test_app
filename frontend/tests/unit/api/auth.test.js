import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  global.fetch = vi.fn();
});

describe('auth api', () => {
  it('uses cognito when endpoint is configured', async () => {
    vi.stubEnv('VITE_COGNITO_ENDPOINT', 'https://cognito.example');
    vi.stubEnv('VITE_COGNITO_CLIENT_ID', 'client-1');

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ AuthenticationResult: { IdToken: 'COGNITO' } })
    });

    const { login } = await import('../../api/auth');

    const token = await login('user', 'pass');

    expect(token).toBe('COGNITO');
    expect(global.fetch).toHaveBeenCalledWith('https://cognito.example/', expect.any(Object));
  });

  it('falls back to local backend when cognito is absent', async () => {
    vi.stubEnv('VITE_COGNITO_ENDPOINT', '');
    vi.stubEnv('VITE_API_BASE', 'http://localhost:8080');

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ idToken: 'LOCAL' })
    });

    const { login } = await import('../../api/auth');

    const token = await login('user', 'pass');

    expect(token).toBe('LOCAL');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/public/login', expect.any(Object));
  });
});
