// src/pages/ForbiddenPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-lfc-red text-white">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="mt-2">You don’t have permission to access this page.</p>
      <p className="mt-2 text-sm">Redirecting to your dashboard...</p>
    </div>
  );
}
