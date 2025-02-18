"use client"

import { useContext, useEffect, useState } from "react"
import { FileIcon, Edit2Icon } from "lucide-react"
import { z } from "zod";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "./ui/button"
import Link from "next/link"

import { actionFavouriteDisconnect } from "@/actions/user-actions"
import { useRouter } from "next/navigation"
import { set } from "zod"
import { toast } from "sonner"
import { SupportedLanguage, useLanguage } from "@/contexts/language-context"
import { ExternalLink } from "./external-link";
import { useSession } from "@/contexts/koksmat-provider";
interface IconWithDetailProps {
  icon: string
  name: string
  link: string
  description: string
  title: string,
  id: number,
  isFavorite: boolean

}
const translationSchema = z.object({
  remove: z.string(),
  open: z.string(),
  searchFor: z.string(),
  favouriteHasBeenRemoved: z.string(),
  toolOpenInNewTabTitle: z.string(),
  toolOpenInNewTabDescription: z.string(),

});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    remove: "Remove",
    open: "Open",
    searchFor: "Search for",
    favouriteHasBeenRemoved: "Favourite has been removed.",
    toolOpenInNewTabTitle: "Opening tool in a new tab",
    toolOpenInNewTabDescription: `The link was opened in a new tab. If it didn't work, you can try again by clicking the button below.`
  },
  da: {
    remove: "Fjern",
    open: "Åben",
    searchFor: "Søg efter",
    favouriteHasBeenRemoved: "Favorit er blevet fjernet.",
    toolOpenInNewTabTitle: "Åbner værktøj i en ny fane",
    toolOpenInNewTabDescription: `Linket blev åbnet i en ny fane. Hvis det ikke virkede, kan du prøve igen ved at klikke på knappen nedenfor.`
  },
  it: {
    remove: "Rimuovi",
    open: "Apri",
    searchFor: "Cerca",
    favouriteHasBeenRemoved: "Preferito è stato rimosso.",
    toolOpenInNewTabTitle: "Apertura dello strumento in una nuova scheda",
    toolOpenInNewTabDescription: `Il collegamento è stato aperto in una nuova scheda. Se non ha funzionato, puoi riprovare facendo clic sul pulsante qui sotto.`
  },
};



export default function IconWithDetail({ icon, name, description, title, link, id, isFavorite }: IconWithDetailProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const session = useSession()


  const router = useRouter()
  const [isRemoving, setisRemoving] = useState(false)

  useEffect(() => {
    setisRemoving(false)
  }, [id])




  return (
    <div className="hover:bg-slate-100 p-2 pt-6 rounded-lg border w-44 h-44" >
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <div className={isRemoving ? "blur" : ""}>
              <div className="h-20  rounded flex items-center justify-center w-full ">
                <img src={icon} />

              </div>
            </div>

          </Link>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">


          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg mb-1">{name}</h3>
          </div>

          <p className="text-sm mb-4">{description}</p>
          <div className="flex justify-between">
            <ExternalLink href={link} title={t.toolOpenInNewTabTitle} description={t.toolOpenInNewTabDescription}>

              <Button

                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                {t.open}
              </Button>


            </ExternalLink>
            {isFavorite && (
              <Button onClick={
                async () => {
                  setisRemoving(true)
                  await actionFavouriteDisconnect(session.token, id)
                  toast(t.favouriteHasBeenRemoved)

                  router.refresh()

                }
              }>
                {t.remove}

              </Button>)}
          </div>



        </HoverCardContent>
      </HoverCard>
      <div className={isRemoving ? "blur" : ""}>

        <div className="items-center justify-center text-center m-2  max-w-32 truncate">
          {title}

        </div></div>

    </div>
  )
}

