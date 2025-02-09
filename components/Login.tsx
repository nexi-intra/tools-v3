"use client"

import type React from "react"
import { useState } from "react"
import { useUser } from "../lib/UserContext"
import { trpc } from '@/trpc/provider';

export default function Login() {



  const { data } = trpc.post.getBySlug.useQuery('hello-world');




  const { login } = useUser()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to verify credentials
    // For this example, we'll just simulate a successful login

    login({
      name: "John Doe",
      email: email,
      roles: ["user"],
    })
  }

  return (
    <form onSubmit={handleLogin}>
      
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input
        
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login - {data?.title}</button>
    </form>
  )
}

