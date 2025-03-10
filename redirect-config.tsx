"use client"

import { useState, useEffect } from "react"
import { Check, Globe, Home, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { set, z } from "zod"
import { SupportedLanguage, useLanguage } from "./contexts/language-context"
import { actionUserHomePageSave } from "./actions/user-actions"
import { useRouter } from "next/navigation"
import { FaRunning } from "react-icons/fa"
const translationSchema = z.object({
  redirectingToHomePage: z.string(),
  youWillBeRedirected: z.string(),
  changeHomePage: z.string(),
  configureHomePage: z.string(),
  selectLanguage: z.string(),
  savePreferences: z.string(),
  english: z.string(),
  danish: z.string(),
  italian: z.string(),
  open: z.string(),

});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    redirectingToHomePage: "Redirecting to Home Page",
    youWillBeRedirected: "You will be redirected to your home page in {timeLeft} seconds",
    changeHomePage: "Change Home Page",
    configureHomePage: "Configure Your Home Page",
    selectLanguage: "Select your preferred language for your home page",
    savePreferences: "Save Preferences",
    english: "English",
    danish: "Danish",
    italian: "Italian",
    open: "Open",
  },
  da: {
    redirectingToHomePage: "Omdirigerer til hjemmesiden",
    youWillBeRedirected: "Du vil blive omdirigeret til din hjemmeside om {timeLeft} sekunder",
    changeHomePage: "Skift hjemmeside",
    configureHomePage: "Konfigurer din hjemmeside",
    selectLanguage: "Vælg dit foretrukne sprog til din hjemmeside",
    savePreferences: "Gem præferencer",
    english: "Engelsk",
    danish: "Dansk",
    italian: "Italiensk",
    open: "Åben",
  },
  it: {
    redirectingToHomePage: "Reindirizzamento alla pagina iniziale",
    youWillBeRedirected: "Verrai reindirizzato alla tua pagina iniziale tra {timeLeft} secondi",
    changeHomePage: "Cambia la pagina iniziale",
    configureHomePage: "Configura la tua pagina iniziale",
    selectLanguage: "Seleziona la lingua preferita per la tua pagina iniziale",
    savePreferences: "Salva preferenze",
    english: "Inglese",
    danish: "Danese",
    italian: "Italiano",
    open: "Apri",
  }
};
interface RedirectConfigProps {
  defaultLanguage: string
  homePageUrl: string

}

export default function RedirectConfig({
  defaultLanguage = "en",
  homePageUrl = "",


}: RedirectConfigProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage)
  const [isConfiguring, setIsConfiguring] = useState(!homePageUrl)
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const [error, seterror] = useState("")
  const [homePage, sethomePage] = useState("")
  const { language } = useLanguage();
  const router = useRouter();

  const t = translations[language];
  const availableLanguages = [
    { code: "en", name: t.english },
    { code: "it", name: t.italian },
    // { code: "fr", name: "French" },
    // { code: "de", name: "German" },
  ]

  useEffect(() => {
    sethomePage(homePageUrl)
  }, [homePageUrl])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (homePage && !isConfiguring) {
      // Start countdown if we have a URL and not in config mode
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1
          setProgress(((5 - newTime) / 5) * 100)

          if (newTime <= 0) {
            clearInterval(timer)
            // Redirect to home page
            router.push(homePage)

          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [homePage, isConfiguring])

  const handleSave = async () => {
    try {
      const result = await actionUserHomePageSave(selectedLanguage)

      if (result.error || !result.homePage) {
        seterror(result.error || "Unknown error")
        return
      }

      setIsConfiguring(false)
      sethomePage(result.homePage)
      setTimeLeft(2)
      setProgress(0)
    } catch (error) {
      seterror(error instanceof Error ? error.message : String(error))
    }


  }

  if (!isConfiguring && homePageUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="space-y-2 text-center">
            {/* <Home className="mx-auto h-12 w-12 text-primary" /> */}
            {/* <h1 className="text-2xl font-bold">{t.redirectingToHomePage}</h1> */}
            <p className="text-muted-foreground">{t.redirectingToHomePage.replace("{timeleft}", timeLeft.toString())}</p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex items-center gap-2">
            <Button variant="link" onClick={() => setIsConfiguring(true)} className="flex items-center gap-2">

              {t.changeHomePage}
            </Button>
            <div className="grow" />
            <Button variant="default" onClick={() => {
              router.push(homePage)
            }} className="flex items-center gap-2">


              {t.open}
            </Button>
          </div>
          <div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          {/* <Globe className="mx-auto h-12 w-12 text-primary" /> */}
          <h1 className="text-2xl font-bold">{t.configureHomePage}</h1>
          <p className="text-muted-foreground">{t.selectLanguage}</p>
        </div>

        <div className="space-y-4">
          <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage} className="space-y-3">
            {availableLanguages.map((language) => (
              <div key={language.code} className="flex items-center space-x-2">
                <RadioGroupItem value={language.code} id={language.code} />
                <Label htmlFor={language.code} className="flex-1 cursor-pointer">
                  {language.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">
          <Check className="h-4 w-4" />
          {t.savePreferences}
        </Button>
      </Card>
    </div>
  )
}

