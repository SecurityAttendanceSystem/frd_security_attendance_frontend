import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

const STORAGE_KEY = "userData";

export const UserProvider = ({ children }) => {
  // Load initial state from localStorage or default to nulls
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { userId: null, userRole: null, userName: null };
  });

  // Save to localStorage whenever userData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  const setUser = (userId, userRole, userName) => {
    setUserData({ userId, userRole, userName });
  };

  const setUserId = (userId) => {
    setUserData((prev) => ({ ...prev, userId }));
  };

  const setUserRole = (userRole) => {
    setUserData((prev) => ({ ...prev, userRole }));
  };

  const setUserName = (userName) => {
    setUserData((prev) => ({ ...prev, userName }));
  };

  return (
    <UserContext.Provider
      value={{
        ...userData,
        setUser,
        setUserId,
        setUserRole,
        setUserName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
