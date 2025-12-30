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
    </v-app-bar>

    <v-main>
      <v-container class="mt-8">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// global layout component
</script>

<style>
body { font-family: system-ui, sans-serif; }
.memo-item { border-bottom: 1px solid rgba(0,0,0,0.08); }
</style>
