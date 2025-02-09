"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'


export default async function Page() {

  const pathname = usePathname()
  return (
    <div>
      <Link href={`${pathname}/en`} > <Button>English</Button> </ Link>
      <Link href={`${pathname}/it`} > <Button>Italian</Button> </ Link>
    </div>
  )
}
