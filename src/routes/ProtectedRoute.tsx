import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface PrivateRouteProps {
  requiredRoles?: string[];
}
const ProtectedRoute: React.FC<PrivateRouteProps> = ({ requiredRoles }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const userRole = user?.role ?? ""; // Asigna un string vacío si es undefined
  const isAuthenticated = user?.isAuthenticated;

  const hasRequiredRole = requiredRoles
    ? requiredRoles.includes(userRole)
    : true;

  if (!isAuthenticated) {
    return <Navigate to="/signin" />; // Redirigir a la página de login si no está autenticado
  } else if (requiredRoles && !hasRequiredRole) {
    return <Navigate to="/" />; // Redirigir a Dashboard si no tiene el rol adecuado
  }

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
