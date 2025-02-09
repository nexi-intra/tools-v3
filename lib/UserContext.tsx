"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface User {
  name: string
  email: string
  roles: string[]
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

const defaultContextValue: UserContextType = {
  user: null,
  isLoggedIn: false,
  login: () => { },
  logout: () => { },
  updateUser: () => { },
}

const UserContext = createContext<UserContextType>(defaultContextValue)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => ({
      ...prevUser!,
      ...userData,
    }))
  }

  return <UserContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

