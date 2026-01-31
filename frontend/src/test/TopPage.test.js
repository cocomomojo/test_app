import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import flushPromises from 'flush-promises';
import TopPage from '../components/TopPage.vue';
import { fetchTop } from '../api/top';

vi.mock('../api/top', () => ({
  fetchTop: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TopPage', () => {
  it('renders fetched top data', async () => {
    fetchTop.mockResolvedValue({
      data: {
        username: 'alice',
        now: '2024-01-01T00:00:00',
        accessCount: 3,
        todoCount: 2
      }
    });

    const wrapper = mount(TopPage);

    await flushPromises();

    expect(wrapper.text()).toContain('alice');
    expect(wrapper.text()).toContain('2024-01-01T00:00:00');
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('2');
  });
});
