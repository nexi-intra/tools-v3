"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'


export default async function Page() {

  const pathname = usePathname()
  return (
    <div>

      <Link href={`${pathname}/explorer`} > <Button>Explorer</Button> </ Link>
      <Link href={`${pathname}/profile`} > <Button>Profile</Button> </ Link>
      <Link href={`${pathname}/board`} > <Button>Boards</Button> </ Link>

    </div>
  )
}
