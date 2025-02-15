"use client";
import TreeView from '@/components/tree-editor';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'


export default async function Page() {

  const pathname = usePathname()
  return (
    <div>
      <TreeView />
    </div>
  )
}
