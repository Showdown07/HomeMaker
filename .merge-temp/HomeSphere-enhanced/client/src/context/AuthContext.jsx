import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: localStorage.getItem("token"),
    loading: true,
  });

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuth({ user: null, token: null, loading: false });
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setAuth({ user: data.data, token, loading: false });
      } catch {
        localStorage.removeItem("token");
        setAuth({ user: null, token: null, loading: false });
      }
    };

    bootstrap();
  }, []);

  const login = (payload) => {
    localStorage.setItem("token", payload.token);
    setAuth({ user: payload, token: payload.token, loading: false });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ user: null, token: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
