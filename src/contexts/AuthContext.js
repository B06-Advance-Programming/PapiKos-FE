import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load token/user on mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch("https://staging-inthekost-b6afc6b23ff0.herokuapp.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) {
          setUser(user);
          setRoles(user.roles.map((r) => r.name));
          setIsLoggedIn(true);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    // Your login logic
    const loginRes = await fetch(
      "https://staging-inthekost-b6afc6b23ff0.herokuapp.com/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!loginRes.ok) {
      throw new Error("Login failed");
    }
    const { token, expiresIn } = await loginRes.json();
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("tokenExpire", Date.now() + expiresIn);

    // Get user data
    const userRes = await fetch(
      "https://staging-inthekost-b6afc6b23ff0.herokuapp.com/users/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!userRes.ok) throw new Error("Failed to fetch user info");
    const user = await userRes.json();
    setUser(user);
    setRoles(user.roles.map((r) => r.name));
    setIsLoggedIn(true);
    setIsLoading(false);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("tokenExpire");
    setUser(null);
    setRoles([]);
    setIsLoggedIn(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, roles, isLoggedIn, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}