import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const PublicRoute = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
