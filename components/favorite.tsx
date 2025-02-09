'use client'

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { z } from "zod"
import { ComponentDoc } from './component-documentation-hub'
import { kError, kVerbose } from '@/lib/koksmat-logger-client'

import { useLanguage, SupportedLanguage } from "@/contexts/language-context"

const favoriteTranslationSchema = z.object({
  removeFavorites: z.string(),
  addFavorites: z.string(),
  favoriteStatus: z.string(),
});

type FavoriteTranslation = z.infer<typeof favoriteTranslationSchema>;

const favoriteTranslationsSchema = z.record(z.enum(["en", "da", "it"]), favoriteTranslationSchema);

type FavoriteTranslations = z.infer<typeof favoriteTranslationsSchema>;

const translations: FavoriteTranslations = {
  en: {
    removeFavorites: "Remove from favorites",
    addFavorites: "Add to favorites",
    favoriteStatus: "Favorite status",
  },
  da: {
    removeFavorites: "Fjern fra favoritter",
    addFavorites: "Tilføj til favoritter",
    favoriteStatus: "Favoritstatus",
  },
  it: {
    removeFavorites: "Rimuovi dai preferiti",
    addFavorites: "Aggiungi ai preferiti",
    favoriteStatus: "Stato preferito",
  },
};

export interface FavoriteProps {
  defaultIsFavorite: boolean
  mode: 'view' | 'new' | 'edit'
  onChange?: (isFavorite: boolean) => void
  className?: string,
  tool_id?: number,
  email?: string,
}

export function FavoriteComponent({
  defaultIsFavorite = false,
  mode = 'view',
  onChange,
  className = '',
  tool_id,
  email
}: FavoriteProps) {
  const { language } = useLanguage();
  const t = translations[language];


  const [isFavorite, setIsFavorite] = useState(defaultIsFavorite)
  const actionName = "userprofileFavourite"

  useEffect(() => {
    setIsFavorite(defaultIsFavorite)
  }, [defaultIsFavorite])

  const handleToggle = async () => {
    if (mode !== 'view') {
      const newState = !isFavorite
      try {
        if (email && tool_id) {
          const data = {
            email, tool_id, is_favorite: newState
          }
          kVerbose("component", "FavoriteComponent onSave", data, mode);
          //TODO: Implement the databaseActions and useKoksmatDatabase
          // const writeOperation = await table.execute(actionName, data)

        }
        setIsFavorite(newState)
        //bumpVersion()
        onChange?.(newState);

      } catch (error) {
        kError("component", "onSave", error)
      }
    }
  }

  const starColor = isFavorite ? 'text-yellow-400' : 'text-gray-400'
  const isInteractive = mode !== 'view'

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Star
        className={`w-6 h-6 ${starColor} ${isInteractive ? 'cursor-pointer hover:text-yellow-500' : ''
          } transition-colors duration-200`}
        fill={isFavorite ? 'currentColor' : 'none'}
        onClick={handleToggle}
        role={isInteractive ? 'button' : 'presentation'}
        aria-label={isInteractive ? (isFavorite ? t?.removeFavorites : t?.addFavorites) : t?.favoriteStatus}
        tabIndex={isInteractive ? 0 : -1}
      />
    </div>
  )
}

export const examplesFavorite: ComponentDoc[] = [
  {
    id: 'FavoriteView',
    name: 'Favorite (View Mode)',
    description: 'A component for displaying favorite status in view mode.',
    usage: `
<Favorite
  defaultIsFavorite={true}
  mode="view"
  onChange={(mode, isFavorite) => console.log(mode, isFavorite)}
/>
    `,
    example: (
      <FavoriteComponent
        defaultIsFavorite={true}
        mode="view"
        onChange={(isFavorite) => console.log(isFavorite)}
      />
    ),
  },
  {
    id: 'FavoriteNew',
    name: 'Favorite (New Mode)',
    description: 'A component for setting favorite status in new mode.',
    usage: `
<Favorite
  defaultIsFavorite={false}
  mode="new"
  onChange={(mode, isFavorite) => console.log(mode, isFavorite)}
/>
    `,
    example: (
      <FavoriteComponent
        defaultIsFavorite={false}
        mode="new"
        onChange={(isFavorite) => console.log(isFavorite)}
      />
    ),
  },
  {
    id: 'FavoriteEdit',
    name: 'Favorite (Edit Mode)',
    description: 'A component for editing favorite status in edit mode.',
    usage: `
<Favorite
  defaultIsFavorite={true}
  mode="edit"
  onChange={(mode, isFavorite) => console.log(mode, isFavorite)}
  className="bg-gray-100 p-2 rounded"
/>
    `,
    example: (
      <FavoriteComponent
        defaultIsFavorite={true}
        mode="edit"
        onChange={(isFavorite) => console.log(isFavorite)}
        className="bg-gray-100 p-2 rounded"
      />
    ),
  },
]

