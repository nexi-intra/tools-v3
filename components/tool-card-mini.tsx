'use client'

import React, { useContext, useState } from 'react'
import { ToolView } from '@/schemas/forms'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ToolCard from './tool-card-large'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

import { ComponentDoc } from './component-documentation-hub'
import { FavoriteComponent } from './favorite'
import TagSelector, { TagType } from './tag'
import { MagicboxContext } from '@/contexts/magicbox-context'
import HighlightedText from './highlightedtext'



interface ToolCardMiniProps {
  tool: ToolView
  isFavorite: boolean
  allowedTags: TagType[]
}

export function ToolCardMiniComponent({ tool, allowedTags, isFavorite }: ToolCardMiniProps) {

  const magicbox = useContext(MagicboxContext)


  return (
    <Card className="w-48 h-48 flex flex-col">
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-1">
            <TagSelector
              tags={allowedTags}
              initialSelectedTags={tool.tags}
              allowMulti={false}
              required={false}
              mode="view"
            //onChange={(_, selected) => handleChange('tags', selected)}

            // className='right-0'
            />
          </div>
          <FavoriteComponent
            mode="edit"
            tool_id={tool.id}
            email={magicbox.user?.email}

            defaultIsFavorite={isFavorite} />
        </div>
        <Link href={tool.url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">


            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 mb-2">
                <img
                  src={tool.icon || '/placeholder.svg'}
                  alt={tool.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>
              <div className="flex items-center justify-center h-24 ">
                <div className="text-center text font-semibold leading-tight text-wrap">
                  <HighlightedText text={tool.name} searchWord={""} />

                </div>
              </div>

            </div>
          </Button>
        </Link>
      </CardContent>

    </Card>
  )
}

// Example usage
function ToolCardMiniExample() {
  const [tool, setTool] = useState<ToolView>({
    id: 1,
    created_at: new Date(),
    created_by: 'John Doe',
    updated_at: new Date(),
    category: { id: 1, value: 'Category 1', color: '#ff0000', order: "1" },
    updated_by: 'Jane Smith',
    deleted_at: null,
    deletedBy: null,
    name: 'Nexi Connect',
    description: `Il servizio per chiedere assistenza sulla dotazione tecnologica aziendale, tramite:

Ticket
Chat
Telefono
    
    `,
    url: 'https://nets.service-now.com/sp',
    groupId: 'tools-group',
    purposes: [],
    tags: [],
    version: '1.0.0',
    status: 'active',
    icon: '/nexiconnect.png',
    documentationUrl: 'https://example.com/docs',

    countries: [],
    documents: [
      { name: 'Manuale Utente', url: 'https://christianiabpos.sharepoint.com/sites/nexiintra-unit-gf-it/SiteAssets/SitePages/Nexi-Connect(1)/Nexi_Connect_Come_fare_per.pdf?web=1' },
      { name: 'Nexi Connect: il nuovo accesso al supporto IT', url: 'https://christianiabpos.sharepoint.com/sites/nexiintra-unit-gf-it/SitePages/it/Nexi-Connect.aspx' }
    ],

  })

  const allowedTags = [
    { id: 1, value: 'tag1', color: '#ff0000', description: 'Tag 1', order: "1" },
    { id: 2, value: 'tag2', color: '#00ff00', description: 'Tag 2', order: "2" },
    { id: 3, value: 'tag2', color: '#0000ff', description: 'Tag 3', order: "3" },
  ]


  const handleFavoriteChange = (isFavorite: boolean) => {
    setTool(prevTool => ({
      ...prevTool,
      status: isFavorite ? 'active' : 'inactive'
    }))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">ToolCardMedium Example</h2>
      <ToolCardMiniComponent
        tool={tool}
        isFavorite={true}
        allowedTags={allowedTags}
      />
    </div>
  )
}

export const examplesToolCardMini: ComponentDoc[] = [
  {
    id: 'ToolCardMedium-Example',
    name: 'ToolCardMedium',
    description: 'A medium-sized card for tools with a pop-up detailed view',
    usage: `
import React, { useState } from 'react'
import { Tool } from '@/app/tools/api/entity/schemas'
import ToolCardMedium from './ToolCardMedium'

function ToolCardMediumExample() {
  const [tool, setTool] = useState<Tool>({
    id: '1',
    createdAt: new Date(),
    createdBy: 'John Doe',
    updatedAt: new Date(),
    updatedBy: 'Jane Smith',
    deletedAt: null,
    deletedBy: null,
    name: 'Sample Tool',
    description: 'This is a sample tool for demonstration purposes. It has a longer description to show how text truncation works in the preview card.',
    url: 'https://example.com/sample-tool',
    groupId: 'tools-group',
    purposeIds: ['purpose1', 'purpose2'],
    tagIds: ['tag1', 'tag2', 'tag3'],
    version: '1.0.0',
    status: 'active',
    icon: '/placeholder.svg',
    documentationUrl: 'https://example.com/docs',
    supportContact: 'support@example.com',
    license: 'MIT',
    compatiblePlatforms: ['Windows', 'Mac', 'Linux'],
    systemRequirements: 'Node.js 14+',
    relatedToolIds: ['tool2', 'tool3'],
    countries: ['US', 'UK', 'CA'],
    repositoryUrl: 'https://github.com/example/sample-tool',
    collaborationType: 'Open Source',
    documents: [
      { name: 'User Guide', url: 'https://example.com/user-guide.pdf' },
      { name: 'API Documentation', url: 'https://example.com/api-docs.pdf' }
    ],
    teamSize: 5,
    primaryFocus: 'Development'
  })

  const allowedTags = [
    { name: 'tag1', color: '#ff0000', description: 'Tag 1' },
    { name: 'tag2', color: '#00ff00', description: 'Tag 2' },
    { name: 'tag3', color: '#0000ff', description: 'Tag 3' },
  ]

  const handleFavoriteChange = (isFavorite: boolean) => {
    setTool(prevTool => ({
      ...prevTool,
      status: isFavorite ? 'active' : 'inactive'
    }))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">ToolCardMedium Example</h2>
      <ToolCardMedium
        tool={tool}
        onFavoriteChange={handleFavoriteChange}
        allowedTags={allowedTags}
      />
    </div>
  )
}
    `,
    example: <ToolCardMiniExample />,
  },
]