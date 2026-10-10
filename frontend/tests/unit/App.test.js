import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../../src/App.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

const createVuetifyInstance = () => {
  return createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'myTheme',
      themes: {
        myTheme: {
          dark: false,
          colors: {
            primary: '#1976D2',
            secondary: '#9C27B0',
            success: '#4CAF50',
            info: '#2196F3',
            error: '#E53935',
            background: '#F5F7FA',
            surface: '#FFFFFF'
          }
        },
        myDarkTheme: {
          dark: true,
          colors: {
            primary: '#64B5F6',
            secondary: '#BA68C8',
            success: '#81C784',
            info: '#64B5F6',
            error: '#EF5350',
            background: '#121212',
            surface: '#1E1E1E'
          }
        }
      }
    }
  });
};

describe('App.vue - Theme Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders theme toggle button in app bar', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    const themeToggleBtn = wrapper.find('[data-testid="theme-toggle-btn"]');
    expect(themeToggleBtn.exists()).toBe(true);
  });

  it('displays moon icon in light mode', async () => {
    localStorage.setItem('app_theme', 'light');
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    const themeToggleBtn = wrapper.find('[data-testid="theme-toggle-btn"]');
    expect(themeToggleBtn.exists()).toBe(true);
    // Verify isDark is false (light mode)
    expect(wrapper.vm.isDark).toBe(false);
  });

  it('displays sun icon in dark mode', async () => {
    localStorage.setItem('app_theme', 'dark');
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    expect(wrapper.vm.isDark).toBe(true);
  });

  it('toggles theme on button click', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    
    const themeToggleBtn = wrapper.find('[data-testid="theme-toggle-btn"]');
    const initialDarkState = wrapper.vm.isDark;
    
    await themeToggleBtn.trigger('click');
    await flushPromises();
    
    expect(wrapper.vm.isDark).toBe(!initialDarkState);
  });

  it('saves theme selection to localStorage', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    const themeToggleBtn = wrapper.find('[data-testid="theme-toggle-btn"]');
    
    // Toggle to dark
    await themeToggleBtn.trigger('click');
    await flushPromises();
    
    expect(localStorage.getItem('app_theme')).toBe('dark');
    
    // Toggle back to light
    await themeToggleBtn.trigger('click');
    await flushPromises();
    
    expect(localStorage.getItem('app_theme')).toBe('light');
  });

  it('restores theme from localStorage on mount', async () => {
    localStorage.setItem('app_theme', 'dark');
    
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    
    expect(wrapper.vm.isDark).toBe(true);
  });

  it('has appropriate title for theme toggle button', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    await flushPromises();
    const themeToggleBtn = wrapper.find('[data-testid="theme-toggle-btn"]');
    
    // In light mode, title should suggest dark mode
    expect(themeToggleBtn.attributes('title')).toBe('ダークモード');
    
    // Toggle to dark mode
    await themeToggleBtn.trigger('click');
    await flushPromises();
    
    // In dark mode, title should suggest light mode
    expect(themeToggleBtn.attributes('title')).toBe('ライトモード');
  });

  it('displays navigation buttons and branding', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        },
        plugins: [createVuetifyInstance()]
      }
    });

    expect(wrapper.text()).toContain('My Memo App');
    expect(wrapper.text()).toContain('トップ');
    expect(wrapper.text()).toContain('TODO');
    expect(wrapper.text()).toContain('メモ');
    expect(wrapper.text()).toContain('ログアウト');
  });
});
