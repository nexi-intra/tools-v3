"use client"
import React, { use, useEffect } from 'react'
import { SupportedLanguage, useLanguage } from "@/contexts/language-context"
export default function SetLanguage({ language }: { language: string }) {
  const { setLanguage } = useLanguage();
  useEffect(() => {
    if (!language) return
    setLanguage(language as SupportedLanguage)

  }, [language])

  return null
}
