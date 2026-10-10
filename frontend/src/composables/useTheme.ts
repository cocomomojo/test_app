import { ref, watch } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';

const THEME_STORAGE_KEY = 'app_theme';
const LIGHT_THEME = 'myTheme';
const DARK_THEME = 'myDarkTheme';

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();
  const isDark = ref(false);

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (stored) {
      isDark.value = stored === 'dark';
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    applyTheme();
  };

  // Apply theme to Vuetify
  const applyTheme = () => {
    vuetifyTheme.global.name.value = isDark.value ? DARK_THEME : LIGHT_THEME;
    localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? 'dark' : 'light');
  };

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
  };

  // Watch for external changes
  watch(isDark, () => {
    applyTheme();
  });

  return {
    isDark,
    toggleTheme,
    initializeTheme
  };
}
