"use client"
import { sessionGetIdToken } from "@/actions/session-actions"
import TokenDisplay from "@/components/token-display"
export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react"

export default async function KeyPage() {

  // const headersList = await headers()
  // const host = headersList.get('host')

  const [token, settoken] = useState("")
  useEffect(() => {
    const load = async () => {
      const host = window.location.hostname
      const token = await sessionGetIdToken(`https://${host}/api`)
      settoken(token!)
    }
    load()
  }, [])

  if (!token) {
    return <div>Loading...</div>
  }
  return (
    <div className="flex flex-col items-center space-y-4 mt-10">
      <TokenDisplay token={token!} />
    </div>

  )

}
