// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../axios/axiosConfig";
import { BackendUser } from "../types/backend/backendUser";

// Definir la interfaz del estado de autenticación
interface AuthState {
  user: BackendUser | null;
  loading: boolean;
  error: string | null;
}

// Obtener los datos del usuario y token desde localStorage al cargar la aplicación
const storedUser = localStorage.getItem("user");
const userFromStorage = storedUser ? JSON.parse(storedUser) : null; // Parseamos el JSON del usuario almacenado

// Estado inicial
const initialState: AuthState = {
  user: userFromStorage
    ? { ...userFromStorage, isAuthenticated: true } // Si hay usuario almacenado, lo cargamos en el estado
    : null, // Si no, dejamos el estado inicial como null
  loading: false,
  error: null,
};

// Definir el tipo de la respuesta de la API
interface LoginResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    photo: string;
    branch: {
      id: string;
      name: string;
      phone: string;
      address: string;
      city: string | null;
    };
  };
  accessToken: string;
}
interface PutUserResponse {
  firstName: string;
  lastName: string;
  email: string;
  updatedAt: string;
}

// Thunk para iniciar sesión
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        "/auth/login",
        credentials
      );
      const data = response.data;

      if (!data.user || !data.accessToken) {
        return rejectWithValue("Error en la respuesta del servidor.");
      }

      // Guardamos los datos del usuario y el token en localStorage
      const userData = {
        id: data.user.id,
        name: data.user.firstName,
        lastname: data.user.lastName,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        photo: data.user.photo,
        token: data.accessToken,
        branch: {
          id: data.user.branch.id,
          name: data.user.branch.name,
          address: data.user.branch.address,
          phone: data.user.branch.phone,
          city: data.user.branch.city,
        },
        isAuthenticated: true,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      return userData; // Devolver el objeto de usuario
    } catch (error: any) {
      console.log("Error desde el slice:", error);

      if (error.response?.data?.message === "Invalid credentials") {
        return rejectWithValue(
          "Correo electrónico inválido o contraseña incorrecta"
        ); // Asegúrate de que este mensaje sea claro para el usuario
      }
      return rejectWithValue("Error en el inicio de sesión"); // Manejar otro tipo de errores
    }
  }
);

// Thunk para actualizar los datos del usuario
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (
    userData: { firstName?: string; lastName?: string; email?: string },
    { getState, rejectWithValue }
  ) => {
    console.log(userData);
    try {
      const state: any = getState();
      const token = state.auth.user?.token;

      if (!token) throw new Error("No autorizado. Token no encontrado.");

      const response = await axiosInstance.patch<PutUserResponse>(
        "/users/me",
        userData
      );

      return response.data;
    } catch (error: any) {
      console.error("Error actualizando el usuario:", error);
      return rejectWithValue(
        error.response?.data?.message || "Error actualizando el usuario."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("user"); // Remover los datos del usuario del localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; //
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = {
            ...state.user,
            name: action.payload.firstName || state.user.name,
            lastname: action.payload.lastName || state.user.lastname,
            email: action.payload.email || state.user.email,
          };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
