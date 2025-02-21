"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import type React from "react" // Added import for React
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { SupportedLanguage, useLanguage } from "@/contexts/language-context"
import { z } from "zod"

const translationSchema = z.object({
  close: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    close: "Close",
  },
  da: {
    close: "Luk",
  },
  it: {
    close: "Chiudi",
  },
};


interface ExternalLinkProps {
  href: string
  children: React.ReactNode
  title: string
  description: string
  onIsOpenChange: (isOpen: boolean) => void
}

export function ExternalLink({ href, children, title, description }: ExternalLinkProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [isOpen, setIsOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    setIsOpen(false)
    setIsOpening(false)
  }, [href])

  const handleLinkClick = async () => {
    setIsOpen(true)
    // setIsOpening(true)
    // //wait 2 secs
    // await new Promise(r => setTimeout(r, 2000));
    // setIsOpening(false)
    window.open(href, "_blank")
  }

  return (

    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div onClick={handleLinkClick} className="inline-flex items-center w-full cursor-pointer">
          {children}

        </div>
      </DialogTrigger>
      <DialogContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {isOpening && <div>Opening</div>}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              {t.close}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

