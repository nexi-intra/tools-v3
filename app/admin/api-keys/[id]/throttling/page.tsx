
import type React from "react"
import ApiKeyThrottlingPage from "./client"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ApiKeyThrottlingPage id={id} />
}

