<template>
  <v-container class="pa-6 d-flex justify-center">
    <v-col cols="12" md="8">
      <v-card class="pa-4" elevation="4">
        <v-row class="d-flex align-center mb-3">
          <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
          <h3 class="ma-0">TODO リスト</h3>
        </v-row>

        <v-row class="mb-6">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4">
              <v-row class="mb-3">
                <v-col>
                  <v-progress-linear
                    data-testid="progress-bar"
                    :value="progressPercentage"
                    :color="progressColor"
                    height="24"
                    rounded
                  >
                    <span class="text-white font-weight-bold" style="font-size: 12px">
                      {{ progressPercentage }}%
                    </span>
                  </v-progress-linear>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="text-center">
                  <div data-testid="progress-stats" class="text-caption">
                    {{ completedCount }} / {{ totalCount }} タスク完了
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col>
            <v-text-field v-model="newTitle" label="新しい TODO を入力" outlined dense />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" :disabled="!newTitle" @click="addTodo">追加</v-btn>
          </v-col>
        </v-row>

        <FilterPanel @apply-filters="applyFilters" @clear-filters="clearFilters" />

        <v-row class="mb-6">
          <v-col class="d-flex gap-2">
            <v-chip
              data-testid="filter-chip-all"
              :variant="activeFilter === 'all' ? 'elevated' : 'outlined'"
              :color="activeFilter === 'all' ? 'primary' : ''"
              @click="activeFilter = 'all'; applySimpleFilter('all')"
            >
              すべて
            </v-chip>
            <v-chip
              data-testid="filter-chip-pending"
              :variant="activeFilter === 'pending' ? 'elevated' : 'outlined'"
              :color="activeFilter === 'pending' ? 'primary' : ''"
              @click="activeFilter = 'pending'; applySimpleFilter('pending')"
            >
              未完了
            </v-chip>
            <v-chip
              data-testid="filter-chip-completed"
              :variant="activeFilter === 'completed' ? 'elevated' : 'outlined'"
              :color="activeFilter === 'completed' ? 'primary' : ''"
              @click="activeFilter = 'completed'; applySimpleFilter('completed')"
            >
              完了
            </v-chip>
          </v-col>
        </v-row>

        <v-list>
          <v-divider />
          <v-list-item
            v-for="todo in filteredTodos"
            :key="todo.id"
            :class="{ 'expired-todo': isExpired(todo) }"
          >
            <v-list-item-action>
              <v-checkbox 
                :model-value="todo.done" 
                @update:model-value="toggleDone(todo, $event)"
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title :class="{ 'text-decoration-line-through': todo.done }">
                {{ todo.title }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="todo.priority || todo.dueDate">
                <v-chip
                  v-if="todo.priority"
                  size="x-small"
                  :color="getPriorityColor(todo.priority)"
                  class="mr-2"
                >
                  {{ getPriorityLabel(todo.priority) }}
                </v-chip>
                <v-chip
                  v-if="todo.dueDate"
                  size="x-small"
                  :color="isExpired(todo) ? 'error' : 'default'"
                >
                  {{ formatDate(todo.dueDate) }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn variant="outlined" class="me-2" @click="edit(todo)" :aria-label="`edit-${todo.id}`"><v-icon>mdi-pencil</v-icon></v-btn>
              <v-btn variant="outlined" color="error" @click="remove(todo.id)" :aria-label="`delete-${todo.id}`"><v-icon>mdi-delete</v-icon></v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </v-list>

        <v-dialog v-model="editing" persistent max-width="500" data-testid="edit-dialog">
          <v-card>
            <v-card-title>編集</v-card-title>
            <v-card-text>
              <v-text-field v-model="editTitle" label="タイトル" outlined dense class="mb-3" />
              <v-select
                v-model="editPriority"
                label="優先度"
                :items="priorityOptions"
                item-title="label"
                item-value="value"
                clearable
                outlined
                dense
                class="mb-3"
              />
              <v-text-field
                v-model="editDueDate"
                type="date"
                label="期限日"
                outlined
                dense
              />
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
import { ref, computed, onMounted } from "vue";
import FilterPanel from "./FilterPanel.vue";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  searchTodos,
} from "../api/todo";

const todos = ref([]);
const newTitle = ref("");
const activeFilter = ref("all");

// 編集用
const editing = ref(false);
const editId = ref(null);
const editTitle = ref("");
const editPriority = ref(null);
const editDueDate = ref("");

// snackbar
const snackbar = ref(false);
const snackMsg = ref("");
const snackColor = ref("success");

// フィルター状態
const currentFilters = ref({});

const priorityOptions = [
  { label: "高", value: "HIGH" },
  { label: "中", value: "MEDIUM" },
  { label: "低", value: "LOW" },
];

const filteredTodos = computed(() => {
  let result = todos.value;

  if (activeFilter.value === "pending") {
    result = result.filter((todo) => !todo.done);
  } else if (activeFilter.value === "completed") {
    result = result.filter((todo) => todo.done);
  }

  return result;
});

const totalCount = computed(() => todos.value.length);

const completedCount = computed(() =>
  todos.value.filter((todo) => todo.done).length
);

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

const progressColor = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage <= 30) return "red";
  if (percentage <= 60) return "warning";
  return "green";
});

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isExpired = (todo) => {
  if (!todo.dueDate || todo.done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(todo.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "HIGH":
      return "error";
    case "MEDIUM":
      return "warning";
    case "LOW":
      return "info";
    default:
      return "default";
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case "HIGH":
      return "高";
    case "MEDIUM":
      return "中";
    case "LOW":
      return "低";
    default:
      return "";
  }
};

const load = async () => {
  const res = await fetchTodos();
  todos.value = res.data;
};

const applyFilters = async (filters) => {
  currentFilters.value = filters;
  const res = await searchTodos(
    filters.priority,
    filters.status,
    filters.dueDateTo,
    filters.dueDateFrom
  );
  todos.value = res.data;
};

const applySimpleFilter = async (filter) => {
  activeFilter.value = filter;
  currentFilters.value = {};
  // フィルター値を設定してから、最新データを読み込む
  // （filteredTodos computed が自動的にフィルタリング）
  await load();
};

const clearFilters = async () => {
  currentFilters.value = {};
  await load();
};

const addTodo = async () => {
  await createTodo({ title: newTitle.value, done: false });
  newTitle.value = "";
  await load();
  snackMsg.value = "TODO を追加しました";
  snackColor.value = "success";
  snackbar.value = true;
};

const toggleDone = async (todo, newValue) => {
  try {
    // API を呼び出して状態を更新
    await updateTodo(todo.id, {
      title: todo.title,
      done: newValue,
      priority: todo.priority,
      dueDate: todo.dueDate,
    });
    
    // Backend から最新データを取得して、UI に反映
    await load();
    
    snackMsg.value = "状態を更新しました";
    snackColor.value = "success";
    snackbar.value = true;
  } catch (error) {
    console.error("TODO状態更新エラー:", error);
    // エラー時は UI をリセット（重要）
    await load();
    snackMsg.value = "更新に失敗しました";
    snackColor.value = "error";
    snackbar.value = true;
  }
};

const edit = (todo) => {
  editing.value = true;
  editId.value = todo.id;
  editTitle.value = todo.title;
  editPriority.value = todo.priority;
  editDueDate.value = todo.dueDate ? formatDate(todo.dueDate) : "";
};

const update = async () => {
  await updateTodo(editId.value, {
    title: editTitle.value,
    done: false,
    priority: editPriority.value,
    dueDate: editDueDate.value || null,
  });
  editing.value = false;
  await load();
  snackMsg.value = "TODO を更新しました";
  snackColor.value = "success";
  snackbar.value = true;
};

const cancel = () => {
  editing.value = false;
};

const remove = async (id) => {
  await deleteTodo(id);
  await load();
  snackMsg.value = "TODO を削除しました";
  snackColor.value = "success";
  snackbar.value = true;
};

onMounted(load);
</script>

<style scoped>
.expired-todo {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>