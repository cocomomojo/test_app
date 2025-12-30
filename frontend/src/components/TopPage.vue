<template>
  <v-container class="pa-6 d-flex justify-center">
    <v-col cols="12" md="8">
      <v-card class="pa-4" elevation="4">
        <v-row class="d-flex align-center mb-3">
          <v-icon class="mr-2" color="primary">mdi-view-dashboard</v-icon>
          <h3 class="ma-0">TOP 画面</h3>
        </v-row>

        <v-list>
          <v-list-item>
            <v-list-item-content>ユーザ名</v-list-item-content>
            <v-list-item-title class="font-weight-bold">{{ data.username }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-content>現在日時</v-list-item-content>
            <v-list-item-title>{{ data.now }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-content>アクセス数</v-list-item-content>
            <v-list-item-title>{{ data.accessCount }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <v-list-item-content>未完了 TODO</v-list-item-content>
            <v-list-item-title>{{ data.todoCount }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions class="mt-4">
          <v-btn color="primary" :to="{ path: '/todo' }" variant="outlined">TODO へ</v-btn>
          <v-btn color="secondary" :to="{ path: '/memo' }" class="ms-2" variant="outlined">メモ へ</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchTop } from "../api/top";

const data = ref({
  username: "",
  now: "",
  accessCount: 0,
  todoCount: 0,
});

onMounted(async () => {
  const res = await fetchTop();
  data.value = res.data;
});
</script>