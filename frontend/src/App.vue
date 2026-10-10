<template>
  <v-app>
    <v-app-bar color="primary" dark elevated>
      <v-app-bar-nav-icon />
      <v-toolbar-title>My Memo App</v-toolbar-title>
      <v-spacer />
      <v-btn text to="/top" :to="{ path: '/top' }">トップ</v-btn>
      <v-btn text to="/todo">TODO</v-btn>
      <v-btn text to="/memo">メモ</v-btn>
      <v-btn text to="/login">ログアウト</v-btn>
      <v-btn
        icon
        @click="toggleTheme"
        data-testid="theme-toggle-btn"
        :title="isDark ? 'ライトモード' : 'ダークモード'"
      >
        <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="mt-8">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';

const vuetifyTheme = useVuetifyTheme();
const isDark = ref(false);

const THEME_STORAGE_KEY = 'app_theme';
const LIGHT_THEME = 'myTheme';
const DARK_THEME = 'myDarkTheme';

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

const applyTheme = () => {
  vuetifyTheme.global.name.value = isDark.value ? DARK_THEME : LIGHT_THEME;
  localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? 'dark' : 'light');
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme();
};

onMounted(() => {
  initializeTheme();
});
</script>

<style>
body { font-family: system-ui, sans-serif; }
.memo-item { border-bottom: 1px solid rgba(0,0,0,0.08); }
</style>
