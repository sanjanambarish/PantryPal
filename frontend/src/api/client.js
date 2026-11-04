import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s for AI processing
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem("access_token", res.data.access);
          original.headers.Authorization = `Bearer ${res.data.access}`;
          return client(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;

// ──────────────────────────────────────────────
// API helpers
// ──────────────────────────────────────────────

export const auth = {
  login:    (data)    => client.post("/auth/login/", data),
  register: (data)    => client.post("/auth/register/", data),
  refresh:  (data)    => client.post("/auth/refresh/", data),
  me:       ()        => client.get("/auth/me/"),
};

export const pantry = {
  list:   ()          => client.get("/pantry/"),
  create: (data)      => client.post("/pantry/create/", data),
  get:    (id)        => client.get(`/pantry/${id}/`),
  update: (id, data)  => client.put(`/pantry/${id}/`, data),
  delete: (id)        => client.delete(`/pantry/${id}/`),
};

export const scan = {
  upload:  (formData) => client.post("/scan/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  }),
  confirm: (data)     => client.post("/scan/confirm/", data),
  history: ()         => client.get("/scan/history/"),
};

export const analytics = {
  get: () => client.get("/analytics/"),
};

export const recipes = {
  get: () => client.get("/recipes/"),
};

export const shopping = {
  list:     ()           => client.get("/shopping-list/"),
  add:      (data)       => client.post("/shopping-list/add/", data),
  update:   (data)       => client.put("/shopping-list/update/", data),
  remove:   (itemId)     => client.delete(`/shopping-list/remove/${itemId}/`),
  generate: ()           => client.post("/shopping-list/generate/"),
};
