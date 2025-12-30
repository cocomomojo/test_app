<template>
  <v-app>
    <v-container class="pa-6">
        <v-row class="d-flex justify-center">
          <v-col cols="12" md="8">
            <v-card class="pa-4 elevation-6">
              <v-row>
                <v-col cols="12" md="5">
                  <div class="d-flex align-center mb-3">
                    <v-icon class="mr-2" color="primary">mdi-file-upload</v-icon>
                    <h3 class="ma-0">画像アップロード</h3>
                  </div>

                  <v-text-field v-model="newTitle" label="タイトルを入力" placeholder="例: 会議メモ" outlined dense/>
                  <v-file-input v-model="selectedFile" label="ファイルを選択" show-size outlined dense />

                  <div class="mt-3">
                    <v-btn color="primary" class="mr-2" @click="upload" :disabled="!selectedFile || !newTitle">
                      <v-icon left>mdi-cloud-upload</v-icon> アップロード
                    </v-btn>
                    <v-btn variant="outlined" @click="clearForm">
                      <v-icon left>mdi-cancel</v-icon> クリア
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="12" md="7">
                  <div class="d-flex align-center mb-3">
                    <v-icon class="mr-2" color="teal">mdi-note-multiple</v-icon>
                    <h3 class="ma-0">メモ一覧</h3>
                  </div>

                  <v-stack>
                    <v-row>
                      <v-col cols="12" v-for="memo in memos" :key="memo.id">
                        <v-card class="pa-3 mb-3" elevation="2">
                          <v-row>
                            <v-col cols="2" class="d-flex align-center">
                              <v-icon color="primary" large>mdi-image</v-icon>
                            </v-col>
                            <v-col cols="8">
                              <v-text-field v-model="memo.titleLocal" label="タイトル" dense hide-details="auto" outlined @blur="saveTitle(memo)"/>
                              <div class="grey--text text--small">更新: {{ formatDate(memo.updatedAt) }}</div>
                            </v-col>
                            <v-col cols="2" class="d-flex align-center justify-end">
                              <v-btn variant="outlined" class="me-2" color="primary" @click="download(memo)" :aria-label="`download-${memo.id}`"><v-icon left>mdi-download</v-icon></v-btn>
                              <v-btn variant="outlined" color="error" @click="remove(memo.id)" :aria-label="`delete-${memo.id}`"><v-icon>mdi-delete</v-icon></v-btn>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-stack>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

    <v-snackbar v-model="snackbar" :color="snackColor" multi-line timeout="3000" location="top">
      {{ snackMsg }}
      <template #actions>
        <v-btn text @click="snackbar = false">閉じる</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { uploadImage, fetchMemos, deleteMemo, updateMemo } from "../api/memo";

const selectedFile = ref(null);
const memos = ref([]);
const newTitle = ref("");

// snackbar
const snackbar = ref(false);
const snackMsg = ref('');
const snackColor = ref('success');

const load = async () => {
  const res = await fetchMemos();
  // attach local editable field so v-model doesn't mutate server objects directly
  memos.value = res.data.map((m) => ({ ...m, titleLocal: m.title }));
};

onMounted(load);

const upload = async () => {
  if (!selectedFile.value) return;
  try {
    await uploadImage(selectedFile.value, newTitle.value);
    await load();
    snackMsg.value = 'アップロードに成功しました';
    snackColor.value = 'success';
    snackbar.value = true;
    selectedFile.value = null;
    newTitle.value = "";
  } catch (e) {
    snackMsg.value = 'アップロードに失敗しました';
    snackColor.value = 'error';
    snackbar.value = true;
  }
};

const remove = async (id) => {
  try {
    await deleteMemo(id);
    memos.value = memos.value.filter((m) => m.id !== id);
    snackMsg.value = 'メモを削除しました';
    snackColor.value = 'success';
    snackbar.value = true;
  } catch (e) {
    snackMsg.value = '削除に失敗しました';
    snackColor.value = 'error';
    snackbar.value = true;
  }
};

const saveTitle = async (memo) => {
  if (!memo.titleLocal) return;
  try {
    await updateMemo(memo.id, { title: memo.titleLocal });
    const refreshed = await fetchMemos();
    const updated = refreshed.data.find((m) => m.id === memo.id);
    if (updated) {
      memo.updatedAt = updated.updatedAt;
    }
    snackMsg.value = 'タイトルを更新しました';
    snackColor.value = 'success';
    snackbar.value = true;
  } catch (e) {
    snackMsg.value = 'タイトル更新に失敗しました';
    snackColor.value = 'error';
    snackbar.value = true;
  }
};

const download = (memo) => {
  // open S3 key url via backend proxy (if implemented) or directly show key
  // for now just open a new tab to backend/memo/file?key=... (backend not implemented); fallback: show s3Key
  alert(`S3キー: ${memo.s3Key || memo.s3key}`);
};

const clearForm = () => {
  newTitle.value = "";
  selectedFile.value = null;
};

const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString();
};
</script>

<style scoped>
/* keep small adjustments */
</style>