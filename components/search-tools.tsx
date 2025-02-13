"use client"
import React, { use, useEffect, useState } from 'react'
import TokenInput, { ErrorDetail } from './token-input';
import { Property } from './token-input-internal';
import { useRouter, usePathname } from "next/navigation";
import { Search } from 'lucide-react';
export type SearchToolsProps = {
  value: string
  placeholder: string
  properties: Property[]
}
export default function SearchTools({ value, placeholder, properties }: SearchToolsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchFor, setsearchFor] = useState("");
  useEffect(() => {
    setsearchFor(value);
  }, [value])

  useEffect(() => {
    // Create a URLSearchParams instance from the current URL
    const params = new URLSearchParams(window.location.search);
    if (searchFor) {
      params.set("q", searchFor);
    } else {
      params.delete("q");
    }
    // Replace the URL with the updated query parameter.
    // Using router.replace prevents adding a new history entry.
    router.push(`${pathname}?${params.toString()}`);
  }, [searchFor, pathname, router]);

  return (
    <div className="flex">
      <Search />
      <TokenInput
        placeholder={placeholder}
        properties={properties}
        value={searchFor}
        onChange={function (
          value: string,
          hasErrors: boolean,
          errors: ErrorDetail[]
        ): void {
          setsearchFor(value);
        }}
      /></div>

  )
}
