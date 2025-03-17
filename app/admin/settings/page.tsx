"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    enableServiceDiscovery: true,
    enableEndpointDiscovery: true,
    enableRequestLogging: true,
    defaultTimeout: "30000",
    maxRequestSize: "1048576",
  })

  const [securitySettings, setSecuritySettings] = useState({
    requireApiKey: true,
    apiKeyExpirationDays: "365",
    rateLimitRequests: "100",
    rateLimitPeriod: "60",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    notifyOnError: true,
    notifyOnTimeout: true,
    errorEmailRecipients: "",
    slackWebhookUrl: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneralSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSecuritySettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSecuritySwitchChange = (name: string, checked: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNotificationSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleNotificationSwitchChange = (name: string, checked: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSuccess("Settings saved successfully")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your microservice broker</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general settings for the microservice broker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableServiceDiscovery">Enable Service Discovery</Label>
                    <p className="text-sm text-muted-foreground">Allow clients to discover available services</p>
                  </div>
                  <Switch
                    id="enableServiceDiscovery"
                    checked={generalSettings.enableServiceDiscovery}
                    onCheckedChange={(checked) => handleGeneralSwitchChange("enableServiceDiscovery", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableEndpointDiscovery">Enable Endpoint Discovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to discover available endpoints for services
                    </p>
                  </div>
                  <Switch
                    id="enableEndpointDiscovery"
                    checked={generalSettings.enableEndpointDiscovery}
                    onCheckedChange={(checked) => handleGeneralSwitchChange("enableEndpointDiscovery", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRequestLogging">Enable Request Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all requests to the microservice broker</p>
                  </div>
                  <Switch
                    id="enableRequestLogging"
                    checked={generalSettings.enableRequestLogging}
                    onCheckedChange={(checked) => handleGeneralSwitchChange("enableRequestLogging", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultTimeout">Default Timeout (ms)</Label>
                  <Input
                    id="defaultTimeout"
                    name="defaultTimeout"
                    type="number"
                    value={generalSettings.defaultTimeout}
                    onChange={handleGeneralChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default timeout for synchronous requests in milliseconds
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRequestSize">Max Request Size (bytes)</Label>
                  <Input
                    id="maxRequestSize"
                    name="maxRequestSize"
                    type="number"
                    value={generalSettings.maxRequestSize}
                    onChange={handleGeneralChange}
                  />
                  <p className="text-xs text-muted-foreground">Maximum allowed request payload size in bytes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security settings for the microservice broker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireApiKey">Require API Key</Label>
                    <p className="text-sm text-muted-foreground">Require API key for all requests</p>
                  </div>
                  <Switch
                    id="requireApiKey"
                    checked={securitySettings.requireApiKey}
                    onCheckedChange={(checked) => handleSecuritySwitchChange("requireApiKey", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKeyExpirationDays">API Key Expiration (days)</Label>
                  <Input
                    id="apiKeyExpirationDays"
                    name="apiKeyExpirationDays"
                    type="number"
                    value={securitySettings.apiKeyExpirationDays}
                    onChange={handleSecurityChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default expiration period for new API keys in days (0 for no expiration)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitRequests">Rate Limit (requests)</Label>
                  <Input
                    id="rateLimitRequests"
                    name="rateLimitRequests"
                    type="number"
                    value={securitySettings.rateLimitRequests}
                    onChange={handleSecurityChange}
                  />
                  <p className="text-xs text-muted-foreground">Maximum number of requests allowed per period</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateLimitPeriod">Rate Limit Period (seconds)</Label>
                  <Input
                    id="rateLimitPeriod"
                    name="rateLimitPeriod"
                    type="number"
                    value={securitySettings.rateLimitPeriod}
                    onChange={handleSecurityChange}
                  />
                  <p className="text-xs text-muted-foreground">Time period for rate limiting in seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notifications for the microservice broker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifyOnError">Notify on Error</Label>
                    <p className="text-sm text-muted-foreground">Send notifications when requests fail with errors</p>
                  </div>
                  <Switch
                    id="notifyOnError"
                    checked={notificationSettings.notifyOnError}
                    onCheckedChange={(checked) => handleNotificationSwitchChange("notifyOnError", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifyOnTimeout">Notify on Timeout</Label>
                    <p className="text-sm text-muted-foreground">Send notifications when requests time out</p>
                  </div>
                  <Switch
                    id="notifyOnTimeout"
                    checked={notificationSettings.notifyOnTimeout}
                    onCheckedChange={(checked) => handleNotificationSwitchChange("notifyOnTimeout", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="errorEmailRecipients">Error Email Recipients</Label>
                  <Textarea
                    id="errorEmailRecipients"
                    name="errorEmailRecipients"
                    placeholder="Enter email addresses (one per line)"
                    value={notificationSettings.errorEmailRecipients}
                    onChange={handleNotificationChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Email addresses to receive error notifications (one per line)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slackWebhookUrl">Slack Webhook URL</Label>
                  <Input
                    id="slackWebhookUrl"
                    name="slackWebhookUrl"
                    placeholder="https://hooks.slack.com/services/..."
                    value={notificationSettings.slackWebhookUrl}
                    onChange={handleNotificationChange}
                  />
                  <p className="text-xs text-muted-foreground">Webhook URL for Slack notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

