'use client'

import React, { useState, useEffect, useContext } from 'react'
import { SupportedLanguage, useLanguage } from "@/contexts/language-context"


import IconUploader from './icon-uploader'
import TagSelector, { TagType } from './tag'
import OneLineTextComponent from './one-line-text'
import MultiLineText from './multi-line-text'
import { FavoriteComponent } from './favorite'
import { FileLinksGridComponent } from './file-links-grid'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import Lookup from './lookup'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { CodeViewer } from './code-viewer'
import { kError } from '@/lib/koksmat-logger-client'
import { MagicboxContext } from '@/contexts/magicbox-context'
import { ToolView } from '@/schemas/forms'

type ModeType = 'view' | 'edit' | 'new'
import { z } from "zod";
import { ComponentDoc } from './component-documentation-hub'



const translationSchema = z.object({
  teams: z.string(),
  addTeam: z.string(),
  platform: z.string(),
  projects: z.string(),
  more: z.string(),
  buildingYourApplication: z.string(),
  dataFetching: z.string(),
  language: z.string(),
  darkMode: z.string(),
  lightMode: z.string(),
  enterToolName: z.string(),
  enterToolDescription: z.string(),
  countries: z.string(),
  purposes: z.string(),
  documents: z.string(),
  enterToolUrl: z.string(),
  openTool: z.string(),
  create: z.string(),
  save: z.string(),
});

export type Translation = z.infer<typeof translationSchema>;

const translations: Record<SupportedLanguage, Translation> = {
  en: {
    teams: "Versions",
    addTeam: "Add Configuration",
    platform: "Solution",
    projects: "Projects",
    more: "More",
    buildingYourApplication: "Building Your Application",
    dataFetching: "Data Fetching",
    language: "Language",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    enterToolName: "Enter tool name",
    enterToolDescription: "Enter tool description",
    countries: "Countries",
    purposes: "Purposes",
    documents: "Documents",
    enterToolUrl: "Enter tool url",
    openTool: "Open Tool",
    create: "Create",
    save: "Save",
  },
  da: {
    teams: "Versioner",
    addTeam: "Tilføj opsætning",
    platform: "Solution",
    projects: "Projekter",
    more: "Mere",
    buildingYourApplication: "Byg din applikation",
    dataFetching: "Datahentning",
    language: "Sprog",
    darkMode: "Mørk tilstand",
    lightMode: "Lys tilstand",
    enterToolName: "Indtast værktøjsnavn",
    enterToolDescription: "Indtast værktøjsbeskrivelse",
    countries: "Lande",
    purposes: "Formål",
    documents: "Dokumenter",
    enterToolUrl: "Indtast værktøjs-url",
    openTool: "Åbn værktøj",
    create: "Opret",
    save: "Gem",
  },
  it: {
    teams: "Versioni",
    addTeam: "Aggiungi Configurazione",
    platform: "Soluzione",
    projects: "Progetti",
    more: "Altro",
    buildingYourApplication: "Costruisci la tua applicazione",
    dataFetching: "Recupero dati",
    language: "Lingua",
    darkMode: "Modalità scura",
    lightMode: "Modalità chiara",
    enterToolName: "Inserisci il nome dello strumento",
    enterToolDescription: "Inserisci la descrizione dello strumento",
    countries: "Paesi",
    purposes: "Scopi",
    documents: "Documenti",
    enterToolUrl: "Inserisci l'URL dello strumento",
    openTool: "Apri strumento",
    create: "Crea",
    save: "Salva",
  },
};




function captionForArray(mode: ModeType, caption: string, arr?: any[]) {
  const hasItems = arr && arr.length > 0
  if ((mode === 'view') && !hasItems) return null
  return <div className='text-xl font-bold ml-2 mt-2'>{caption}</div>
}

interface ToolCardProps {
  tool: ToolView
  mode: ModeType
  onSave?: (data: ToolView, mode: ModeType) => void
  className?: string
  allowedTags: TagType[]
  allowedPurposes: { name: string; code: string; sortorder: string }[]
  allowedCountries: { name: string; code: string }[]
  isFavorite: boolean
  searchvalue?: string
}

export default function ToolCard({
  tool: initialTool,
  mode,
  onSave,
  className = '',
  allowedTags,
  isFavorite,
  searchvalue
}: ToolCardProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [name, setName] = useState(initialTool.name)
  const [description, setDescription] = useState(initialTool.description)
  const [icon, setIcon] = useState(initialTool.icon)
  const [url, setUrl] = useState(initialTool.url)
  const [tags, setTags] = useState(initialTool.tags)
  const [countries, setCountries] = useState(initialTool.countries)
  const [purposes, setPurposes] = useState(initialTool.purposes)
  const [documents, setDocuments] = useState(initialTool.documents)
  const [categoryId, setcategoryId] = useState(initialTool.category.id)
  const [categoryValue, setcategoryValue] = useState(initialTool.category.value)
  const [categoryColor, setcategoryColor] = useState(initialTool.category.color)

  const magicbox = useContext(MagicboxContext)
  const [error, seterror] = useState("")


  useEffect(() => {
    setName(initialTool.name)
    setDescription(initialTool.description)
    setIcon(initialTool.icon)
    setUrl(initialTool.url)
    setTags(initialTool.tags)
    setCountries(initialTool.countries)
    setPurposes(initialTool.purposes)
    setDocuments(initialTool.documents)
  }, [initialTool])

  useEffect(() => {
    if (mode === "new") {
      setName('')
      setDescription('')
      setIcon('')
      setUrl('')
      setTags([])
      setCountries([])
      setPurposes([])
      setDocuments([])
    }
  }, [mode])

  const handleSave = () => {
    if (onSave) {
      const updatedTool: ToolView = {
        ...initialTool,
        name,
        description,
        icon,
        url,
        tags,
        countries,
        purposes,
        documents,
        status: isFavorite ? 'active' : 'inactive'
      }
      onSave(updatedTool, mode)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex grow">
          <IconUploader
            size={48}
            mode={mode}
            onUpdate={(_, newIcon) => setIcon(newIcon)}
            initialIcon={icon}
            className="w-[48px] h-[48px]"
          />
          <OneLineTextComponent
            initialValue={name}
            placeholder={t?.enterToolName}
            mode={mode}
            onChange={(_, value) => setName(value)}
            className='text-2xl font-bold ml-3'
          />
        </div>

        <div className="flex items-center space-x-2 pt-3">
          <TagSelector
            tags={allowedTags}
            initialSelectedTags={[{
              id: categoryId,
              value: categoryValue,
              color: categoryColor,
              order: ""
            }]}
            allowMulti={false}
            required={false}
            mode={mode}
            lazyLoad
            onChange={(selected) => {
              setcategoryId(selected[0].id)
              setcategoryValue(selected[0].value)
              setcategoryColor(selected[0].color)
            }}
            loadItems={async () => {
              try {
                //TODO: hook into new data service
                return []
                // const categories = await database.query("categories")
                // return categories.map((category: any) => ({ id: category.id, value: category.name, order: category.sortorder, color: category.color }))
              } catch (error) {
                kError("component", "Data read error", error);
                seterror("" + error)
                return []
              }
            }}
          />
          <FavoriteComponent
            mode={"edit"}
            tool_id={initialTool.id}
            email={magicbox.user?.email}
            defaultIsFavorite={isFavorite}
            className='mt-[-8px]'
          />
        </div>
      </CardHeader>
      <CardContent>
        <MultiLineText
          initialValue={description}
          placeholder={t?.enterToolDescription}
          mode={mode}
          onChange={(_, value) => setDescription(value)}
          searchFor={searchvalue}
        />

        {captionForArray(mode, t?.purposes, purposes)}
        <Lookup
          className='p-2'
          initialSelectedItems={purposes?.map(purpose => ({ id: purpose.id, value: purpose.value, sortorder: purpose.order })) ?? []}
          items={purposes?.map(purpose => ({ id: purpose.id, value: purpose.value, sortorder: purpose.order })) ?? []}
          mode={mode}
          onChange={(selectedItems) => {
            const selectedPurposes = selectedItems.map(item => ({ id: item.id, value: item.value, order: item.sortorder }))
            setPurposes([...selectedPurposes])
          }}
          lazyLoad
          loadItems={async () => {
            try {
              //TODO: hook into new data service
              return []

              // const readDataOperation = await database.query("purposes")
              // return readDataOperation.map((purpose: any) => ({ id: purpose.id, value: purpose.name, sortorder: purpose.sortorder }))
            } catch (error) {
              kError("component", "Data read error", error);
              seterror("" + error)
              return []
            }
          }}
          required={true}
        />

        {captionForArray(mode, t?.documents, documents)}
        <FileLinksGridComponent
          initialLinks={documents?.map((doc, index) => ({
            id: index.toString(),
            name: doc.name,
            url: doc.url,
            type: 'pdf'
          })) || []}
          mode={mode}
          columns={mode === "view" ? 2 : 1}
          onUpdate={(_, links) => setDocuments(links.map(link => ({ name: link.name, url: link.url })))}
        />
        {mode !== 'view' && (
          <OneLineTextComponent
            initialValue={url}
            placeholder={t?.enterToolUrl}
            mode={mode}
            onChange={(_, value) => setUrl(value)}
          />
        )}
        {mode === 'view' && (
          <div className="flex justify-center w-full mt-4">
            <Link href={url} target="_blank">
              <Button variant="default" onClick={e => e.stopPropagation()} disabled={!url}>
                {t?.openTool}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {mode !== 'view' && (
          <Button onClick={(e) => {
            e.stopPropagation()
            handleSave()
          }}>
            {mode === 'new' ? t?.create : t?.save}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function ToolCardExample() {
  const { language } = useLanguage();
  const t = translations[language];

  const [mode, setMode] = useState<'view' | 'edit' | 'new'>('view')
  const [tool, setTool] = useState<ToolView>({
    id: 1,
    created_at: new Date(),
    created_by: 'John Doe',
    updated_at: new Date(),
    updated_by: 'Jane Smith',
    deleted_at: null,
    deletedBy: null,
    name: 'Nexi Connect',
    category: { id: 1, value: 'Category 1', color: '#ff0000', order: "" },
    description: `Il servizio per chiedere assistenza sulla dotazione tecnologica aziendale, tramite:

Ticket
Chat
Telefono
    
    `,
    url: 'https://nets.service-now.com/sp',
    groupId: 'tools-group',
    purposes: [{ value: 'Purpose 1', id: 1, order: '1' }, { value: 'Purpose 2', id: 2, order: '2' }],
    tags: [],
    version: '1.0.0',
    status: 'active',
    icon: '/nexiconnect.png',
    documentationUrl: 'https://example.com/docs',


    countries: [{ value: 'Italy', id: 1, order: '1' }],

    documents: [

      { name: 'Nexi Connect: il nuovo accesso al supporto IT', url: 'https://christianiabpos.sharepoint.com/sites/nexiintra-unit-gf-it/SitePages/it/Nexi-Connect.aspx' }
    ],

  })
  const [isFavorite, setIsFavorite] = useState(false)

  const allowedTags = [
    { id: 1, value: 'tag1', color: '#ff0000', description: 'Tag 1', order: "1" },
    { id: 2, value: 'tag2', color: '#00ff00', description: 'Tag 2', order: "2" },
    { id: 3, value: 'tag2', color: '#0000ff', description: 'Tag 3', order: "3" },
  ]

  const allowedCountries = [
    { id: 1, name: 'Italy', code: 'it' },
    { id: 2, name: 'France', code: 'fr' },
    { id: 3, name: 'Germany', code: 'de' },
  ]

  const allowedPurposes = [
    { id: 1, name: 'Purpose 1', code: 'PUR1', sortorder: '1' },
    { id: 2, name: 'Purpose 2', code: 'PUR2', sortorder: '2' },
    { id: 3, name: 'Purpose 3', code: 'PUR3', sortorder: '3' },
  ]

  const handleSave = (updatedTool: ToolView, saveMode: 'view' | 'edit' | 'new') => {
    console.log('Saved:', updatedTool, 'Mode:', saveMode)
    setTool(updatedTool)
    setMode('view')
  }

  const handleFavoriteChange = (newFavoriteState: boolean) => {
    setIsFavorite(newFavoriteState)
    console.log('Favorite changed:', newFavoriteState)
  }

  return (
    <>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>{t?.teams}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={mode} onValueChange={(value: 'view' | 'edit' | 'new') => setMode(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
          <ToolCard
            tool={tool as ToolView}
            mode={mode}
            onSave={handleSave}
            allowedTags={allowedTags}
            allowedCountries={allowedCountries}
            allowedPurposes={allowedPurposes}
            isFavorite={isFavorite}
          />
        </CardContent>
      </Card>
      <CodeViewer filename="tool.json" language="json" code={JSON.stringify(tool, null, 2)} />
    </>
  )
}

export const examplesToolCard: ComponentDoc[] = [
  {
    id: 'ToolCard-AllModes',
    name: 'ToolCard - All Modes',
    description: 'ToolCard component with view/edit/new mode selector, allowed tags, and favorite management',
    usage: `
import React, { useState } from 'react'
import { ToolView } from '@/app/tools/schemas/forms'
import ToolCard from './ToolCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-context"
import translations from './translations'

function ToolCardExample() {
  const { language } = useLanguage();
  const t = translations[language];

  const [mode, setMode] = useState<'view' | 'edit' | 'new'>('view')
  const [tool, setTool] = useState<ToolView>({
    // ... (tool properties)
  })
  const [isFavorite, setIsFavorite] = useState(false)

  const allowedTags = [
    { id: 1, value: 'tag1', color: '#ff0000', description: 'Tag 1', order: "1" },
    { id: 2, value: 'tag2', color: '#00ff00', description: 'Tag 2', order: "2" },
    { id: 3, value: 'tag3', color: '#0000ff', description: 'Tag 3', order: "3" },
  ]

  const handleSave = (updatedTool: ToolView, saveMode: 'view' | 'edit' | 'new') => {
    console.log('Saved:', updatedTool, 'Mode:', saveMode)
    setTool(updatedTool)
    setMode('view')
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{t?.teams}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={mode} onValueChange={(value: 'view' | 'edit' | 'new') => setMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="edit">Edit</SelectItem>
            <SelectItem value="new">New</SelectItem>
          </SelectContent>
        </Select>
        <ToolCard
          tool={tool}
          mode={mode}
          onSave={handleSave}
          allowedTags={allowedTags}
          isFavorite={isFavorite}
        />
      </CardContent>  
    </Card>
  )
}
    `,
    example: <ToolCardExample />,
  },
]

