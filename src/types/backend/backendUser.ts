export interface BackendUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  username: string;
  token: string;
  role: string; // Definir roles específicos
  isAuthenticated: boolean;
  photo: string;
  phone?: string; // Aquí agregas phone como opcional
  bio?: string;
  facebook?: string;
  xcom?: string;
  linkedin?: string;
  instagram?: string;
  branch: {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string | null;
  };
}
