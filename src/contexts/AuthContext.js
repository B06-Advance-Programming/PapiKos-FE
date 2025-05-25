import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) {
          setUser(user);

          const rolesArr = user.roles.map((r) => r.name);
          setRoles(rolesArr);
          // Store roles names array as JSON string in localStorage
          localStorage.setItem("userRoles", JSON.stringify(rolesArr));

          setIsLoggedIn(true);

          // Store userId in localStorage
          localStorage.setItem("userId", user.id);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const loginRes = await fetch(
      `${API_BASE_URL}/auth/login`,
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
      `${API_BASE_URL}/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!userRes.ok) throw new Error("Failed to fetch user info");
    const user = await userRes.json();
    setUser(user);

    const rolesArr = user.roles.map((r) => r.name);
    setRoles(rolesArr);
    // Store roles names array as JSON string in localStorage
    localStorage.setItem("userRoles", JSON.stringify(rolesArr));

    setIsLoggedIn(true);
    setIsLoading(false);

    localStorage.setItem("userId", user.id); // store userId after login

    return user;
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("tokenExpire");
    localStorage.removeItem("userId");  // remove userId on logout
    localStorage.removeItem("userRoles"); // remove stored roles on logout
    setUser(null);
    setRoles([]);
    setIsLoggedIn(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isLoggedIn,
        login,
        logout,
        isLoading,
        token: localStorage.getItem("jwtToken"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}