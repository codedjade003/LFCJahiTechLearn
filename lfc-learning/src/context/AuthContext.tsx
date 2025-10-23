import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface UserProfile {
  role: string;
  technicalUnit: string;
  coverPhoto: any;
  lastLogin: string | number | Date;
  loginCount: number;
  streak: any;
  name: string;
  email: string;
  username?: string;
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
    current: boolean;
  }[];
  profilePicture?: {
    position(position: any): unknown;
    publicid: string;
    url: string;
  };
  dateOfBirth?: string;
  maritalStatus?: string;
  phoneNumber?: string;
  address?: any;
  bio?: string;
  occupation?: string;
  company?: string;
  skills?: string[];
  socialLinks?: any;
  preferences?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // Handle blacklisted users
      if (res.status === 403 && data.isBlacklisted) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("isVerified");
        setUser(null);
        navigate("/", { 
          state: { 
            blacklisted: true, 
            reason: data.reason 
          } 
        });
        return;
      }
      
      if (res.status === 401) {
        logout();
      } else if (!res.ok) {
        setUser(null);
      }
      
      if (res.ok) {
        setUser(data.user || data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }

  }, [API_BASE, logout, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
