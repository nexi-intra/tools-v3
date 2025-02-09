"use client"
import { useUser } from "../contexts/UserContext"

export default function Profile() {
  const { user, isLoggedIn, logout, updateUser } = useUser()

  if (!isLoggedIn) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Roles: {user?.roles.join(", ")}</p>
      <button onClick={() => updateUser({ name: "New Name" })}>Update Name</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

