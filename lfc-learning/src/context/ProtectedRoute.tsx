// src/context/ProtectedRoute.tsx
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children?: JSX.Element;
  allowedRoles?: string[]; // optional, lets you restrict routes by role
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const isVerifiedRaw = localStorage.getItem("isVerified");
  const isVerified = isVerifiedRaw === null ? true : isVerifiedRaw === "true";
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 🔹 Must be logged in
  if (!token) return <Navigate to="/" replace />;

  // 🔹 Must be verified
  if (!isVerified) return <Navigate to="/verify-email" replace />;

  // 🔹 Role restriction (only if allowedRoles is set)
  if (allowedRoles && !allowedRoles.includes(role || "")) {
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  return children;
}
