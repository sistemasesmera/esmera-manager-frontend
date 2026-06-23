import axios from "axios";

// Production mode = https://esmera-manager-backend.onrender.com
const axiosInstance = axios.create({
  baseURL: "https://esmera-manager-backend.onrender.com",
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar un token de autorización si es necesario
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = user.token; // Extrae el token del objeto user
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para la response
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Maneja los errores globalmente
    //  if (error.response && error.response.status === 401) {
    // Por ejemplo, redirige al login si el token expira
    // window.location.href = "/login";
    //}
    return Promise.reject(error);
  }
);

export default axiosInstance;
