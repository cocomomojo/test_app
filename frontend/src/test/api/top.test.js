import { describe, it, expect, vi, beforeEach } from 'vitest';

let requestInterceptor;
let apiInstance;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => {
      apiInstance = {
        get: vi.fn(),
        interceptors: {
          request: {
            use: vi.fn((fn) => { requestInterceptor = fn; })
          }
        }
      };
      return apiInstance;
    })
  }
}));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe('top api', () => {
  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('idToken', 'TOKEN');

    await import('../../api/top');

    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer TOKEN');
  });

  it('calls correct endpoint', async () => {
    const apiModule = await import('../../api/top');

    await apiModule.fetchTop();

    expect(apiInstance.get).toHaveBeenCalledWith('/top');
  });
});
