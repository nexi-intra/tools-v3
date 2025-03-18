
import type React from "react"
import EditServicePage from "./client"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditServicePage id={id} />
}

