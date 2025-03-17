
import type React from "react"
import EndpointThrottlingPage from "./client"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EndpointThrottlingPage id={id} />
}

