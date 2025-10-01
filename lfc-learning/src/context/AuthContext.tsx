import { createContext, useContext, useEffect, useState } from "react";
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 401) {
        logout(); // clear token + redirect
      } else if (!res.ok) {
        setUser(null); // temporary issue
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

  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

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
