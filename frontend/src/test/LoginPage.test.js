import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import flushPromises from 'flush-promises';
import LoginPage from '../components/LoginPage.vue';
import { login } from '../api/auth';

let push = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}));

vi.mock('../api/auth', () => ({
  login: vi.fn()
}));

beforeEach(() => {
  push = vi.fn();
  localStorage.clear();
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('logs in and navigates on success', async () => {
    login.mockResolvedValue('TOKEN');

    const wrapper = mount(LoginPage);
    expect(wrapper.text()).toContain('こんばんは');
    const greeting = wrapper.find('.mb-2');
    const usernameInput = wrapper.find('input');
    expect(greeting.element.compareDocumentPosition(usernameInput.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('testuser');
    await inputs[1].setValue('Test1234!');

    const button = wrapper.findAll('button').find(b => b.text().includes('ログイン'));
    await button.trigger('click');

    await flushPromises();

    expect(login).toHaveBeenCalledWith('testuser', 'Test1234!');
    expect(localStorage.getItem('idToken')).toBe('TOKEN');
    expect(push).toHaveBeenCalledWith('/top');
  });

  it('shows error message on failure', async () => {
    login.mockRejectedValue(new Error('fail'));

    const wrapper = mount(LoginPage);

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('bad');
    await inputs[1].setValue('nope');

    const button = wrapper.findAll('button').find(b => b.text().includes('ログイン'));
    await button.trigger('click');

    await flushPromises();

    expect(wrapper.text()).toContain('ログインに失敗しました');
  });
});
