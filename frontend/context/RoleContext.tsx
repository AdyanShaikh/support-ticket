"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "agent" | "customer";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAgent: boolean;
  isCustomer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("agent");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("support_crm_role") as UserRole;
    if (saved === "agent" || saved === "customer") {
      setRoleState(saved);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("support_crm_role", newRole);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAgent: role === "agent",
        isCustomer: role === "customer",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
