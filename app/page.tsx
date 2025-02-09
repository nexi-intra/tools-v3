"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'


export default async function Page() {


  return (
    <Link href={`/pages`} > <Button>Pages</Button> </ Link>
  )
}
