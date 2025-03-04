"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { SupportedLanguage, useLanguage } from "@/contexts/language-context";
import { z } from "zod";
const translationSchema = z.object({
  includeGroupTools: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    includeGroupTools: "Include Group tools",
  },
  da: {
    includeGroupTools: "Inkluder gruppeværktøjer",
  },
  it: {
    includeGroupTools: "Includi applicativi di gruppo",

  }
};
export function GroupToolsToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage();
  const t = translations[language];
  // Get include general tools state from URL query parameters
  // Default to true if not specified
  const includeGroupTools = searchParams.get("grouptools") !== "false"

  // Toggle include general tools state
  const toggleIncludeGeneralTools = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (includeGroupTools) {
      params.set("grouptools", "false")
    } else {
      params.delete("grouptools")
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="grouptools" checked={includeGroupTools} onCheckedChange={toggleIncludeGeneralTools} />
      <label
        htmlFor="grouptools"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {t.includeGroupTools}
      </label>
    </div>
  )
}

