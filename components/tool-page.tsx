

import React, { } from "react";
import { SupportedLanguage } from "@/contexts/language-context";
import { z } from "zod";
import prisma from "@/prisma";
import { ToolCardMediumComponent } from "./tool-card-medium";
import { ToolView } from "@/schemas/forms";
import { getKoksmatTokenCookie } from "@/lib/auth";
import { mapTool2ToolView } from "@/internal/maps";
import ToolCard from "./tool-card-large";


const translationSchema = z.object({
  noToolFoundTitle: z.string(),
  notLoggedIn: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {

    noToolFoundTitle: "No tools found",
    notLoggedIn: "Not logged in",

  },
  da: {

    noToolFoundTitle: "Ingen værktøjer fundet",
    notLoggedIn: "Ikke logget ind",

  },
  it: {

    noToolFoundTitle: "Nessun strumento trovato",

    notLoggedIn: "Non connesso",
  }
};



export async function ToolPage(props: { id: number, language: SupportedLanguage }) {
  const language = props.language;
  const t = translations[language];
  const session = await getKoksmatTokenCookie();
  if (!session) {
    return <div className="text-red-500 p-20">{t.notLoggedIn}</div>
  }
  const currentUserProfile = await prisma.userProfile.findUnique({
    where: {
      id: session.userId,
    },
  });

  const tool = await prisma.tool.findFirst({
    where: {
      id: props.id
    },
    include: {
      category: true,
      userProfiles: {
        where: { id: currentUserProfile?.id },
        take: 1,
      },

    }
  });

  if (!tool) {
    return <div className="text-red-500 p-20">{t.noToolFoundTitle}</div>
  }

  const toolView: ToolView = mapTool2ToolView(language, tool, tool.category.name, tool.category.color ?? "#444444", tool.category.id, "0");
  return (<div className="p-3" >
    <ToolCard allowedTags={[]} isFavorite={tool.userProfiles.length > 0} tool={toolView} searchvalue={""} mode={"view"} allowedPurposes={[]} allowedCountries={[]} />

  </div>
  )

}


export default ToolPage;