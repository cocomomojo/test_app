import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

// JWT を自動付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTodos = () => api.get("/todo");
export const createTodo = (todo) => api.post("/todo", todo);
export const updateTodo = (id, todo) => api.put(`/todo/${id}`, todo);
export const deleteTodo = (id) => api.delete(`/todo/${id}`);

export const searchTodos = (priority, status, dueDateBefore, dueDateAfter) => {
  const params = new URLSearchParams();
  if (priority) params.append("priority", priority);
  if (status === "completed") params.append("done", "true");
  if (status === "pending") params.append("done", "false");
  if (dueDateBefore) params.append("dueDateBefore", dueDateBefore);
  if (dueDateAfter) params.append("dueDateAfter", dueDateAfter);

  return api.get("/todo/search", { params });
};