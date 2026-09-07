<template>
  <v-card variant="outlined" class="pa-4 mb-4">
    <v-row class="mb-3">
      <v-col cols="12">
        <h4 class="ma-0">フィルター</h4>
      </v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedPriority"
          label="優先度"
          :items="priorityOptions"
          item-title="label"
          item-value="value"
          clearable
          dense
          outlined
          data-testid="filter-priority"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedStatus"
          label="ステータス"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          clearable
          dense
          outlined
          data-testid="filter-status"
        />
      </v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="dueDateFrom"
          type="date"
          label="期限開始日"
          dense
          outlined
          data-testid="filter-due-date-from"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="dueDateTo"
          type="date"
          label="期限終了日"
          dense
          outlined
          data-testid="filter-due-date-to"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col class="d-flex gap-2">
        <v-btn
          color="primary"
          @click="applyFilters"
          data-testid="filter-apply-btn"
        >
          フィルター適用
        </v-btn>
        <v-btn
          variant="outlined"
          @click="clearFilters"
          data-testid="filter-clear-btn"
        >
          リセット
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

const selectedPriority = ref(null);
const selectedStatus = ref(null);
const dueDateFrom = ref("");
const dueDateTo = ref("");

const priorityOptions = [
  { label: "高", value: "HIGH" },
  { label: "中", value: "MEDIUM" },
  { label: "低", value: "LOW" },
];

const statusOptions = [
  { label: "未完了", value: "pending" },
  { label: "完了", value: "completed" },
];

const emit = defineEmits(["apply-filters", "clear-filters"]);

const applyFilters = () => {
  emit("apply-filters", {
    priority: selectedPriority.value,
    status: selectedStatus.value,
    dueDateFrom: dueDateFrom.value,
    dueDateTo: dueDateTo.value,
  });
};

const clearFilters = () => {
  selectedPriority.value = null;
  selectedStatus.value = null;
  dueDateFrom.value = "";
  dueDateTo.value = "";
  emit("clear-filters");
};
</script>
