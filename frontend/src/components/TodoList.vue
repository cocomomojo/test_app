<template>
  <v-container class="pa-6 d-flex justify-center">
    <v-col cols="12" md="8">
      <v-card class="pa-4" elevation="4">
        <v-row class="d-flex align-center mb-3">
          <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
          <h3 class="ma-0">TODO リスト</h3>
        </v-row>

        <v-row class="mb-4">
          <v-col>
            <v-text-field v-model="newTitle" label="新しい TODO を入力" outlined dense />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" :disabled="!newTitle" @click="addTodo">追加</v-btn>
          </v-col>
        </v-row>

        <v-list>
          <v-divider />
          <v-list-item v-for="todo in todos" :key="todo.id">
            <v-list-item-action>
              <v-checkbox v-model="todo.done" @change="toggleDone(todo)" />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title :class="{ 'text-decoration-line-through': todo.done }">{{ todo.title }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn variant="outlined" class="me-2" @click="edit(todo)" :aria-label="`edit-${todo.id}`"><v-icon>mdi-pencil</v-icon></v-btn>
              <v-btn variant="outlined" color="error" @click="remove(todo.id)" :aria-label="`delete-${todo.id}`"><v-icon>mdi-delete</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </v-list>

        <v-dialog v-model="editing" persistent max-width="500">
          <v-card>
            <v-card-title>編集</v-card-title>
            <v-card-text>
              <v-text-field v-model="editTitle" label="タイトル" outlined dense />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="cancel">キャンセル</v-btn>
              <v-btn color="primary" @click="update">更新</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </v-col>
    <v-snackbar v-model="snackbar" :color="snackColor" timeout="2500">{{ snackMsg }}<template #actions><v-btn text @click="snackbar=false">閉じる</v-btn></template></v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../api/todo";

const todos = ref([]);
const newTitle = ref("");

// 編集用
const editing = ref(false);
const editId = ref(null);
const editTitle = ref("");

// snackbar
const snackbar = ref(false);
const snackMsg = ref('');
const snackColor = ref('success');

const load = async () => {
  const res = await fetchTodos();
  todos.value = res.data;
};

const addTodo = async () => {
  await createTodo({ title: newTitle.value, done: false });
  newTitle.value = "";
  await load();
  snackMsg.value = 'TODO を追加しました';
  snackColor.value = 'success';
  snackbar.value = true;
};

const toggleDone = async (todo) => {
  await updateTodo(todo.id, { title: todo.title, done: todo.done });
  await load();
  snackMsg.value = '状態を更新しました';
  snackColor.value = 'success';
  snackbar.value = true;
};

const edit = (todo) => {
  editing.value = true;
  editId.value = todo.id;
  editTitle.value = todo.title;
};

const update = async () => {
  await updateTodo(editId.value, { title: editTitle.value, done: false });
  editing.value = false;
  await load();
  snackMsg.value = 'TODO を更新しました';
  snackColor.value = 'success';
  snackbar.value = true;
};

const cancel = () => {
  editing.value = false;
};

const remove = async (id) => {
  await deleteTodo(id);
  await load();
  snackMsg.value = 'TODO を削除しました';
  snackColor.value = 'success';
  snackbar.value = true;
};

onMounted(load);
</script>