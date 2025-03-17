"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ApiKey {
  id: string
  key: string
  name: string
  description: string | null
  active: boolean
  expiresAt: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApiKeys() {
      try {
        const response = await fetch("/api/admin/api-keys")
        const data = await response.json()
        setApiKeys(data.apiKeys)
      } catch (error) {
        console.error("Error fetching API keys:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const filteredApiKeys = apiKeys.filter(
    (apiKey) =>
      apiKey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apiKey.description && apiKey.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">Manage authentication keys for the microservice broker</p>
        </div>
        <Link href="/admin/api-keys/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Generate API Key
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm">
            API keys are used to authenticate requests to the microservice broker. Each key should be kept secure and
            can be revoked at any time.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search API keys..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredApiKeys.length > 0 ? (
              filteredApiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                        {apiKey.key.substring(0, 8)}...
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyKey(apiKey.key)}>
                        {copiedKey === apiKey.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span className="sr-only">Copy API key</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.description || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(apiKey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.active ? "default" : "outline"}>
                      {apiKey.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/api-keys/${apiKey.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No API keys found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

