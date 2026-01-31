import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔁 Load auth state on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // 🔹 LOGIN
  const login = (email, password) => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    const found = storedUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) return false;

    setUser(found);
    setIsAuthenticated(true); // 🔥 KEY LINE
    localStorage.setItem("user", JSON.stringify(found));

    return true;
  };

  // 🔹 REGISTER (prevent duplicate email)
  const register = (newUser) => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    const exists = storedUsers.some((u) => u.email === newUser.email);
    if (exists) {
      return { success: false, message: "Email already registered" };
    }

    storedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    return { success: true };
  };

  // 🔹 LOGOUT
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
