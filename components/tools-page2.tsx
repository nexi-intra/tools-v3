

import React, { } from "react";
import { SupportedLanguage } from "@/contexts/language-context";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/prisma";
import { ToolCardMediumComponent } from "./tool-card-medium";
import { ToolView } from "@/schemas/forms";
import SearchTools from "./search-tools";
import { MyToolList } from "@/components//my-tool-list";
import { MyToolListServer } from "./my-tools-list-server";


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



export async function ToolsPage2(props: { query: string }) {

  const tools = (await prisma.tool.findMany({
    where: {
      name: {
        contains: props.query,
        mode: "insensitive"
      }
    }

  })).sort((a, b) => a.name.localeCompare(b.name));

  const t = translations["en"];



  return (
    <div className="h-full w-full">
      <div className="lg:flex">
        <main className="w-full lg:w-3/4">


          <div className=" min-w-full ">
            <div className="relative">
              <h3 className="font-semibold mb-2 sticky top-10 bg-white dark:bg-gray-800 text-3xl z-10 p-4">
                {t?.yourTools}
              </h3>
              <MyToolListServer searchFor={""} />
            </div>
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800">
              <SearchTools value={props.query} placeholder={"Search for"} properties={[]} />
            </div>
            <div className="relative">
              <div className="flex flex-wrap">
                {tools.map((tool, key) => {
                  const toolView: ToolView = {

                    purposes: [],
                    description: tool.description!,
                    status: "deprecated",
                    deleted_at: null,
                    category: { value: "Corp", color: "#123141", id: 0, order: "" },
                    name: tool.name,
                    id: 0,
                    created_at: new Date(),
                    created_by: "",
                    updated_at: new Date(),
                    updated_by: "",
                    url: tool.url,
                    documents: [

                    ],
                    groupId: "",
                    tags: [],
                    version: ""
                  }
                  return <div key={key} className="p-3" >
                    <ToolCardMediumComponent allowedTags={[]} isFavorite={false} tool={toolView} />

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