
import type React from "react"
import ServiceThrottlingPage from "./client"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ServiceThrottlingPage id={id} />
}

