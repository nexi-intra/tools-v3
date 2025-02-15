import TreeView from '@/components/tree-editor'
import React from 'react'


export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ appnode_name: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const appnode_id = (await params).appnode_name

  return (
    <div>
      {appnode_id}
      <TreeView />
    </div>
  )
}
