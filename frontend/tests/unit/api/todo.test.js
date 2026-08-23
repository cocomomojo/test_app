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

describe('todo api', () => {
  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('idToken', 'TOKEN');

    await import('../../api/todo');

    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer TOKEN');
  });

  it('calls correct endpoints', async () => {
    const apiModule = await import('../../api/todo');

    await apiModule.fetchTodos();
    await apiModule.createTodo({ title: 'a' });
    await apiModule.updateTodo(1, { title: 'b' });
    await apiModule.deleteTodo(1);

    expect(apiInstance.get).toHaveBeenCalledWith('/todo');
    expect(apiInstance.post).toHaveBeenCalledWith('/todo', { title: 'a' });
    expect(apiInstance.put).toHaveBeenCalledWith('/todo/1', { title: 'b' });
    expect(apiInstance.delete).toHaveBeenCalledWith('/todo/1');
  });
});
