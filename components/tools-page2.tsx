

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
  },
  da: {
    yourTools: "Dine værktøjer",
    allTools: "Alle værktøjer",
    yourProfile: "Din profil",
    purposes: "Formål",
    categories: "Kategorier",
    searchTools: "Søg værktøjer...",
  },
  it: {
    yourTools: "I tuoi strumenti",
    allTools: "Tutti gli strumenti",
    yourProfile: "Il tuo profilo",
    purposes: "Scopi",
    categories: "Categorie",
    searchTools: "Cerca strumenti...",
  },
};



export async function ToolsPage2(props: { query: string, language: SupportedLanguage }) {
  const searchWords = extractSearchTokens(props.query);



  // const tools = (await prisma.tool.findMany({
  //   where: {
  //     OR: [
  //       {
  //         name: {
  //           contains: props.query ?? "",
  //           mode: "insensitive"
  //         },
  //       },

  //       {
  //         description: {
  //           contains: props.query ?? "",
  //           mode: "insensitive"
  //         }
  //       }
  //     ]
  //   },
  //   orderBy: {
  //     name: "asc"
  //   },
  // }

  // ))
  const searchText = "your search text";
  const languageCode = "en"; // For example, "en" for English
  const language = props.language;
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
  });


  //const tools = databaseitems.sort((a, b) => a.name.localeCompare(b.name));

  const t = translations[language];
  return (
    <div className="h-full w-full">
      <div className="lg:flex">
        <main className="w-full lg:w-3/4">
          <div className=" min-w-full ">
            <div className="relative">
              <h3 className="font-semibold mb-2 sticky top-10 bg-white dark:bg-gray-800 text-3xl z-10 p-4">
                {t?.yourTools}
              </h3>
              {JSON.stringify(searchWords)}
              <MyToolListServer searchFor={""} />
            </div>
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
              <SearchTools value={props.query} placeholder={"Search for"} properties={[
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

                {tools.map((tool: Tool, key): React.JSX.Element => {
                  const parsedTranslations = translationJSONDatabaseFieldSchema.safeParse(tool.translations)
                  if (!parsedTranslations.success) {
                    console.error(parsedTranslations.error)
                  }
                  const translatedName = getTranslation(parsedTranslations.data, "name", language, tool.name)
                  const translatedDescription = getTranslation(parsedTranslations.data, "description", language, tool.description!)
                  const parsedDocuments = documentsJSONDatabaseFieldSchema.safeParse(tool.documents)
                  if (!parsedDocuments.success) {
                    console.error(parsedDocuments.error)
                  }

                  const toolView: ToolView = {

                    purposes: [],
                    description: translatedDescription,
                    status: "deprecated",
                    deleted_at: null,
                    category: { value: "Corp", color: "#123141", id: 0, order: "" },
                    name: translatedName,
                    id: 0,
                    created_at: new Date(),
                    created_by: "",
                    updated_at: new Date(),
                    updated_by: "",
                    url: tool.url,
                    documents: parsedDocuments.data ?? [],
                    groupId: "",
                    tags: [],
                    version: ""
                  }
                  return <div key={key} className="p-3" >
                    <ToolCardMediumComponent allowedTags={[]} isFavorite={false} tool={toolView} searchvalue={props.query} />

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