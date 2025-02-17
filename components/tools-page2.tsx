

import React, { } from "react";
import { SupportedLanguage } from "@/contexts/language-context";
import { z } from "zod";
import prisma from "@/prisma";
import { ToolCardMediumComponent } from "./tool-card-medium";
import { ToolView } from "@/schemas/forms";
import SearchTools from "./search-tools";
import { MyToolListServer } from "./my-tools-list-server";
import { getTranslation } from "@/schemas/_shared";
import { documentsJSONDatabaseFieldSchema, translationJSONDatabaseFieldSchema } from "@/schemas/database";
import { extractSearchTokens } from "@/lib/search";
import { Tool } from "@prisma/client"
import { ToolCardMiniComponent } from "./tool-card-mini";
import IconWithDetail from "./icon-with-detail";
import { getKoksmatTokenCookie } from "@/lib/auth";
import { mapTool2ToolView } from "@/internal/maps";
import { decodeJwt } from "@/lib/tokens";

interface ToolsPageProps {
  className?: string;
  searchParams: {
    q?: string;
  };
}

const translationSchema = z.object({
  yourTools: z.string(),
  allTools: z.string(),
  yourProfile: z.string(),
  purposes: z.string(),
  categories: z.string(),
  searchTools: z.string(),
  noToolFoundTitle: z.string(),
  noToolFoundGuide: z.string(),
  searchFor: z.string(),
  notLoggedIn: z.string(),
});

type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    yourTools: "Your Tools",
    allTools: "All Tools",
    yourProfile: "Your profile",
    purposes: "Purposes",
    categories: "Categories",
    searchTools: "Search tools...",
    noToolFoundTitle: "No tools found",
    noToolFoundGuide: "Find a tool in the list and click the star to mark it as a Favorite",
    searchFor: "Search for",
    notLoggedIn: "Not logged in",
  },
  da: {
    yourTools: "Dine værktøjer",
    allTools: "Alle værktøjer",
    yourProfile: "Din profil",
    purposes: "Formål",
    categories: "Kategorier",
    searchTools: "Søg værktøjer...",
    noToolFoundTitle: "Ingen værktøjer fundet",
    noToolFoundGuide: "Find et værktøj på listen og klik på stjernen for at markere det som en favorit",
    searchFor: "Søg efter",
    notLoggedIn: "Ikke logget ind",
  },
  it: {
    yourTools: "I tuoi strumenti",
    allTools: "Tutti gli strumenti",
    yourProfile: "Il tuo profilo",
    purposes: "Scopi",
    categories: "Categorie",
    searchTools: "Cerca strumenti...",
    noToolFoundTitle: "Nessun strumento trovato",
    noToolFoundGuide: "Trova uno strumento nell'elenco e fai clic sulla stella per contrassegnarlo come preferito",
    searchFor: "Cerca",
    notLoggedIn: "Non connesso",
  }
};



export async function ToolsPage2(props: { query: string, language: SupportedLanguage, token?: string }) {

  const searchWords = extractSearchTokens(props.query);



  const searchText = "your search text";
  const languageCode = "en"; // For example, "en" for English
  const language = props.language;
  const session = await getKoksmatTokenCookie();
  const token = props.token;
  let id: number = -1
  if (!session && !props.token) {
    return <div className="text-red-500 p-20">Not logged in</div>
  }
  else {
    if (session) {
      id = session.userId
    }
    else if (token) {
      const jwt = decodeJwt(token);
      const upn = jwt.upn;
      const user = await prisma.userProfile.findFirst({
        where: {
          name: upn,
        },
        include: {
          Session: true,
        },
      });
      if (!user) {
        return <div className="text-red-500 p-20">Not logged in</div>
      }
      id = user.id

    }

  }

  const currentUserProfile = await prisma.userProfile.findUnique({
    where: {
      id
    },
  });
  const tools = await prisma.tool.findMany({
    where: {

      ToolTexts: {
        // Using the "some" filter ensures that at least one related ToolText meets the criteria.
        some: {
          language: {
            code: language, // Filtering by the language code in the related Language record.
          },
          OR: [
            {
              name: {
                contains: props.query ?? "",
                mode: "insensitive", // Optional: makes the search case-insensitive.
              },
            },
            {
              description: {
                contains: props.query ?? "",
                mode: "insensitive",
              },
            },
          ],
        },
      },
    },
    include: {
      userProfiles: {
        where: { id: currentUserProfile?.id },
        // Optionally, if you expect only one result, you can limit it:
        take: 1,
      },
      category: true,
    }
  });
  const yourTools = await prisma.tool.findMany({
    where: {
      userProfiles: {
        some: {
          id: currentUserProfile?.id,
        },

      },


    },
    include: {
      userProfiles: {
        where: { id: currentUserProfile?.id },
        // Optionally, if you expect only one result, you can limit it:
        take: 1,
      },
      purposes: true,
      category: true,
    }
  });


  //const tools = databaseitems.sort((a, b) => a.name.localeCompare(b.name));

  const t = translations[language];
  return (
    <div className="h-full w-full">
      <div className="lg:flex">
        <main className="w-full">
          <div className=" min-w-full ">
            <div className="relative">
              <h3 className="font-semibold mb-2 sticky top-10 bg-white dark:bg-gray-800 text-3xl z-10 p-4">
                {currentUserProfile?.displayName} - {t?.yourTools}
              </h3>
              <div className="relative">
                <div className="flex flex-wrap">
                  {yourTools.length === 0 && <div className="p-3" >
                    <div className="text-center text-2xl p-10">{t.noToolFoundTitle}</div>
                    <div>{t.noToolFoundGuide}</div>
                  </div>}


                  {yourTools.map((tool, key): React.JSX.Element => {
                    // const p = tool.purposes.map((purpose) => purpose.name).join(", ");
                    // tool.name = tool.name + " " + p
                    const toolView: ToolView = mapTool2ToolView(language, tool, tool.category.name, tool.category.color ?? "#444444", tool.category.id, "0");
                    return <div key={key} className="p-3" >
                      {/* <ToolCardMiniComponent allowedTags={[]} isFavorite={tool.userProfiles.length > 0} tool={toolView} /> */}
                      {/* <ToolCardMediumComponent allowedTags={[]} isFavorite={tool.userProfiles.length > 0} tool={toolView} searchvalue={props.query} /> */}
                      <IconWithDetail id={tool.id}

                        isFavorite={tool.userProfiles.length > 0}
                        icon={toolView.icon!} title={toolView.name} description={toolView.description} name={toolView.name} link={toolView.url} />
                    </div>
                  })}

                </div>
              </div>

            </div>
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
              <h3 className="font-semibold mb-2 sticky top-15 bg-white dark:bg-gray-800 text-3xl z-10 p-4">
                {t?.allTools}
              </h3>

              <SearchTools value={props.query} placeholder={t.searchFor} properties={[
                //   {
                //   name: "country",
                //   values: [
                //     { value: "square", icon: <FaCircle color="red" />, color: "green" },
                //     { value: "star", icon: <FaSquare />, color: "purple" },
                //   ]
                // }

              ]} />
            </div>
            <div className="relative">
              <div className="flex flex-wrap">

                {tools.map((tool, key): React.JSX.Element => {
                  const toolView: ToolView = mapTool2ToolView(language, tool, tool.category.name, tool.category.color ?? "#444444", tool.category.id, "0");
                  return <div key={key} className="p-3" >
                    <ToolCardMediumComponent allowedTags={[]} isFavorite={tool.userProfiles.length > 0} tool={toolView} searchvalue={props.query} />

                  </div>
                })}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

}




export default ToolsPage2;