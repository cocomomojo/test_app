<template>
  <v-container class="d-flex justify-center pa-6">
    <v-card class="pa-6" max-width="480">
      <v-card-title>ログイン</v-card-title>
      <v-card-text>
        <v-text-field v-model="username" label="ユーザ名" outlined dense />
        <v-text-field v-model="password" label="パスワード" type="password" outlined dense />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="doLogin"><v-icon left>mdi-login</v-icon> ログイン</v-btn>
      </v-card-actions>
      <v-card-text v-if="error">
        <div style="color: red">{{ error }}</div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { login } from "../api/auth";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const error = ref("");

const router = useRouter();

const doLogin = async () => {
  try {
    const token = await login(username.value, password.value);

    localStorage.setItem("idToken", token);

    router.push("/top");
  } catch (e) {
    error.value = "ログインに失敗しました";
  }
};
</script>