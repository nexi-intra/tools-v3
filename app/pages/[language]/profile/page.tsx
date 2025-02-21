"use client"

import { use, useEffect, useState } from "react"






import { ProfileForm } from "@/components/profile-form"
import { useGraph } from "@/hooks/usegraph"
import { getProfileCache, ProfileCache } from "@/services/cache"
import { Membership } from "@/schemas/profile"
import { httpsGetAll } from "@/contexts/httphelper"
export const dynamic = 'force-dynamic'

export interface Value {
  "@odata.type": string
  id: string
  deletedDateTime: any
  description: string
  displayName: string
  roleTemplateId: string
}
export default function SettingsProfilePage() {

  const { result, token } = useGraph("https://graph.microsoft.com/v1.0/me/memberOf?$count=true", ["User.Read"])
  const [data, setdata] = useState<ProfileCache>()
  const [membersOf, setmembersOf] = useState<Membership[]>([])




  useEffect(() => {
    const load = async () => {

      if (!result) {
        return
      }
      if (!token) {
        console.log("no token")
        return
      }
      if (result.hasError) {
        console.log(result.errorMessage)
        return
      }
      const memberships = await httpsGetAll<Value>(token, "https://graph.microsoft.com/v1.0/me/memberOf?$count=true&$filter=startswith(mailNickname,'nexiintra-newschannel-')")

      const members: Membership[] = (memberships.data ?? []).map((m) => {
        return {
          groupId: m.id,
          groupDisplayName: m.displayName
        }
      })
      setmembersOf(members)


    }

    load()

  }, [result, token])

  useEffect(() => {
    const load = async () => {
      const dataResult = await getProfileCache()
      if (!dataResult.hasError) {
        setdata(dataResult.data)
      }
    }
    load()

  }, [])

  const existingProfile: any = {} //await getprofile(upn)
  //const data = await getProfileCache()
  const country = existingProfile?.country ?? ""
  const unit = existingProfile?.unit ?? ""
  return (
    <div className="space-y-6">

      <ProfileForm memberships={membersOf} currentUnit={unit} currentCountry={country} newsCategories={data?.categories ?? []} newsChannels={data?.channels ?? []} countries={data?.countries ?? []} units={data?.units ?? []} />

    </div>
  )

}
