"use client"

import { z } from 'zod';
import { ToolCardMediumComponent } from "./tool-card-medium";
import { ToolView } from '@/schemas/forms'
import { useUserProfile } from "@/contexts/userprofile-context";
import { getTranslation } from "@/schemas/_shared";
import { useLanguage } from "@/contexts/language-context";

type SupportedLanguage = "en" | "da" | "it";

const translationSchema = z.object({
  en: z.object({
    noFavoriteTools: z.string(),
    noFavoriteToolsDescription: z.string(),
  }),
  da: z.object({
    noFavoriteTools: z.string(),
    noFavoriteToolsDescription: z.string(),
  }),
  it: z.object({
    noFavoriteTools: z.string(),
    noFavoriteToolsDescription: z.string(),
  }),
});

type TranslationType = z.infer<typeof translationSchema>;

const translations: TranslationType = {
  en: {
    noFavoriteTools: "No favourite tools",
    noFavoriteToolsDescription: "You haven't selected any favourite tools, find tools that you find relevant and click on the star",
  },
  da: {
    noFavoriteTools: "Ingen favoritværktøjer",
    noFavoriteToolsDescription: "Du har ikke valgt nogen favoritværktøjer, find værktøjer, du finder relevante, og klik på stjernen",
  },
  it: {
    noFavoriteTools: "Nessun applicativo preferito",
    noFavoriteToolsDescription: "Non hai selezionato alcuno applicativo preferito, trova quello che ritieni rilevante e clicca sulla stella",
  },
};

export function MyToolList(props: { searchFor?: string; onLoaded?: () => void }) {
  const { version } = useUserProfile();
  const viewName = "my_tools"

  const { language } = useLanguage();
  const t = translations[language as SupportedLanguage];
  return null
  //TODO: Implement this
  /*
  return (
    <div className="relative">
      <DatabaseItemsViewer
        options={{
          heightBehaviour: "Dynamic",
          hideToolbar: true,
          version,
          componentNoItems: (
            <div className="flex">
              <div className="grow" />
              <div className="p-10 border">
                <div className="text-2xl mb-2">{t?.noFavoriteTools}</div>
                {t?.noFavoriteToolsDescription}
              </div>
              <div className="grow" />
            </div>
          )
        }}
        searchFor={props.searchFor}
        schema={view.schema}
        renderItem={(tool, viewMode) => {
          const toolView: ToolView = {
            id: tool.id,
            name: getTranslation(tool.translations, "name", language, tool.name),
            description: getTranslation(tool.translations, "description", language, tool.description),
            url: tool.url,
            created_by: tool.created_by,
            updated_by: tool.updated_by,
            deleted_at: tool.deleted_at,
            icon: tool.icon ?? "/placeholder.svg",
            groupId: "",
            documents: tool.documents,
            purposes: tool.purposes.map((purpose: any) => { return { id: purpose.id, value: purpose.name }; }),
            countries: tool.countries.map((country: any) => { return { id: country.id, value: country.name }; }),
            tags: tool.tags,
            version: "",
            status: tool.status,
            created_at: tool.created_at,
            updated_at: tool.updated_at,
            category: { color: tool.category_color, id: tool.category_id, value: tool.category_name, order: "" },
          };

          return (
            <div>
              <ToolCardMediumComponent
                tool={toolView}
                isFavorite={tool.is_favorite}
                allowedTags={[]}
              />
            </div>
          );
        }}
        viewName={viewName}
        tableName={""}
      />
    </div>
  )*/
}

export function MyToolList2(props: { searchFor?: string; onLoaded?: () => void }) {
  const { version } = useUserProfile();
  const viewName = "my_tools"

  const { language } = useLanguage();
  const t = translations[language as SupportedLanguage];
  return null
  //TODO: Implement this
  /*
  return (
    <div className="relative">
      <DatabaseItemsViewer
        options={{
          heightBehaviour: "Dynamic",
          hideToolbar: true,
          version,
          componentNoItems: (
            <div className="flex">
              <div className="grow" />
              <div className="p-10 border">
                <div className="text-2xl mb-2">{t?.noFavoriteTools}</div>
                {t?.noFavoriteToolsDescription}
              </div>
              <div className="grow" />
            </div>
          )
        }}
        searchFor={props.searchFor}
        schema={view.schema}
        renderItem={(tool, viewMode) => {
          const toolView: ToolView = {
            id: tool.id,
            name: getTranslation(tool.translations, "name", language, tool.name),
            description: getTranslation(tool.translations, "description", language, tool.description),
            url: tool.url,
            created_by: tool.created_by,
            updated_by: tool.updated_by,
            deleted_at: tool.deleted_at,
            icon: tool.icon ?? "/placeholder.svg",
            groupId: "",
            documents: tool.documents,
            purposes: tool.purposes.map((purpose: any) => { return { id: purpose.id, value: purpose.name }; }),
            countries: tool.countries.map((country: any) => { return { id: country.id, value: country.name }; }),
            tags: tool.tags,
            version: "",
            status: tool.status,
            created_at: tool.created_at,
            updated_at: tool.updated_at,
            category: { color: tool.category_color, id: tool.category_id, value: tool.category_name, order: "" },
          };

          return (
            <div>
              <ToolCardMediumComponent
                tool={toolView}
                isFavorite={tool.is_favorite}
                allowedTags={[]}
              />
            </div>
          );
        }}
        viewName={viewName}
        tableName={""}
      />
    </div>
  )*/
}
