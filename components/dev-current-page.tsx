"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { findFilePathForUrl, openInCode } from "@/dev/dev-manager";



export default function DevCurrentPage(props: { children: React.ReactNode }) {
  const children = props.children;
  const pathname = usePathname();

  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!pathname) return;

    const load = async () => {
      setFileName((await findFilePathForUrl(pathname, "app")))
    }
    load()
  }, [pathname]);

  if (process.env.NODE_ENV === "production") return null;
  return (
    <div>
      <div
        onClick={() => {

          openInCode(fileName);
        }}
      >
        {children}
      </div>
    </div>
  );
}
