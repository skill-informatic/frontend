import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactElement } from "react";

export default function PublicRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
