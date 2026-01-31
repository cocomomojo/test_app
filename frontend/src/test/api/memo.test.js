import { describe, it, expect, vi, beforeEach } from 'vitest';

let requestInterceptor;
let apiInstance;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => {
      apiInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
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

describe('memo api', () => {
  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('idToken', 'TOKEN');

    await import('../../api/memo');

    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer TOKEN');
  });

  it('calls correct endpoints', async () => {
    const apiModule = await import('../../api/memo');

    await apiModule.fetchMemos();
    await apiModule.deleteMemo(1);
    await apiModule.updateMemo(2, { title: 'New' });

    expect(apiInstance.get).toHaveBeenCalledWith('/memo');
    expect(apiInstance.delete).toHaveBeenCalledWith('/memo/1');
    expect(apiInstance.put).toHaveBeenCalledWith('/memo/2', { title: 'New' });
  });

  it('uploads image with form data', async () => {
    const apiModule = await import('../../api/memo');
    apiInstance.post.mockResolvedValue({ data: { ok: true } });

    const file = new File(['abc'], 'memo.png', { type: 'image/png' });
    await apiModule.uploadImage(file, 'Title');

    expect(apiInstance.post).toHaveBeenCalled();
    const [url, formData, config] = apiInstance.post.mock.calls[0];

    expect(url).toBe('/memo/upload');
    expect(formData instanceof FormData).toBe(true);
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
  });
});
