import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// JWT を Authorization ヘッダに付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadImage = async (file, title) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);

  const res = await api.post("/memo/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // Memo object returned
};

export const fetchMemos = async () => api.get('/memo');

export const deleteMemo = async (id) => api.delete(`/memo/${id}`);

export const updateMemo = async (id, data) => api.put(`/memo/${id}`, data);