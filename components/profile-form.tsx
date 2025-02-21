"use client"

import { get } from "http"
import { useContext, useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CaretSortIcon, CheckIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { CommandList } from "cmdk"

import { useForm } from "react-hook-form"
import * as z from "zod"




import { IProgressProps, ProcessStatusOverlay } from "./progress"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"



import {
  Country,
  Me,
  Membership,
  NewsCategory,
  NewsChannel,
  Unit,
} from "@/schemas/profile"


import { Button } from "@/components/ui/button"
import { MagicboxContext } from "@/contexts/magicbox-context"
import { cn } from "@/lib/utils"
import { GenericTable } from "./table"
import { GenericItem } from "./table/data/schema"

const profileFormSchema = z.object({
  country: z.string({ required_error: "Please select a country." }),
  unit: z.string({
    required_error: "Please select an unit to display.",
  }),
  channels: z.array(z.string({})).optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>


function match(channel: NewsChannel, unit: string, country: string): boolean {
  let found = false
  channel?.RelevantUnits?.forEach((relevantUnit) => {
    if (relevantUnit.LookupValue.toLowerCase() === unit) {
      found = true
    }
  })
  channel?.RelevantCountires?.forEach((relevantCountry) => {
    if (relevantCountry.LookupValue.toLowerCase() === country) {
      found = true
    }
  })

  return found
}

export function ProfileForm(props: {
  currentUnit: string
  currentCountry: string
  newsCategories: NewsCategory[]
  newsChannels: NewsChannel[]
  countries: Country[]
  units: Unit[]
  memberships: Membership[]
}) {
  const { newsCategories, newsChannels, countries, units, memberships } = props
  const magicbox = useContext(MagicboxContext)
  const [showCountries, setshowCountries] = useState(false)
  const [showUnits, setshowUnits] = useState(false)
  const [showChannels, setshowChannels] = useState(false)
  //const [newsChannels, setNewsChannels] = useState<NewsChannel[]>([])
  // const [countries, setCountries] = useState<Country[]>([])
  // const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([])
  //const [units, setUnits] = useState<Unit[]>([])
  const [defaultChannels, setdefaultChannels] = useState<NewsChannel[]>([])
  const [processing, setProcessing] = useState(false)
  const [processPercentage, setProcessPercentage] = useState(0)
  const [processTitle, setProcessTitle] = useState("")
  const [processDescription, setProcessDescription] = useState("")
  const [lastResult, setlastResult] = useState<any>()

  const accessToken = magicbox.session?.accessToken ?? ""

  //const [memberships, setmemberships] = useState<Membership[]>()
  const [stringMemberships, setstringMemberships] = useState<string[]>([])
  const [keepOld, setkeepOld] = useState<boolean>(true)

  useEffect(() => {
    const localStorageData = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : {}

    if (localStorageData.country && localStorageData.unit) {
      form.setValue("country", localStorageData.country)
      form.setValue("unit", localStorageData.unit)
    }
  }, [])



  useEffect(() => {
    const names: string[] = []
    for (const obj of (memberships ?? []).filter((a) => {
      return true
    })) {
      names.push(obj.groupDisplayName.replace("News Channel - ", ""))
    }
    setstringMemberships(names)
  }, [memberships])

  useEffect(() => {
    //const selected = form.getValues("channels") as string[]
    if (keepOld) {
      if (watchChannels !== undefined) {
        form.setValue("channels", [
          ...stringMemberships,
          ...(watchChannels?.filter((i) => !stringMemberships.includes(i)) ??
            []),
        ])
      } else {
        form.setValue("channels", stringMemberships)
      }
    } else {
      //from current form value, remove all that are in stringMemberships
      if (watchChannels !== undefined) {
        form.setValue(
          "channels",
          watchChannels?.filter((i) => !stringMemberships.includes(i))
        )
      } else {
        form.setValue("channels", stringMemberships)
      }
    }
  }, [keepOld])

  // useEffect(() => {
  //   const load = async () => {
  //     setNewsChannels((await getNewsChannels(accessToken)) ?? [])
  //     setCountries((await getCountries(accessToken)) ?? [])
  //     setUnits((await getUnits(accessToken)) ?? [])
  //     setNewsCategories((await getNewsCategories(accessToken)) ?? [])
  //   }
  //   if (accessToken) load()
  // }, [accessToken])

  // This can come from your database or API.
  const defaultValues: Partial<ProfileFormValues> = {
    unit: props.currentUnit,
    country: props.currentCountry,
  }
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  async function onSubmit(data: ProfileFormValues) {
    debugger
    setProcessTitle("Saving profile")
    setProcessDescription("Please wait while we save your profile.")
    setProcessPercentage(0)
    setProcessing(true)


    const oldMemberShips = memberships.map((i) => i.groupId)
    // stringMemberships
    //   ?.map((channel) => {
    //     const c = newsChannels.find(
    //       (i) => i.channelName.toLowerCase() === channel.toLowerCase()
    //     )
    //     return c?.GroupId ?? ""
    //   })
    //   .filter((i) => i !== "") ?? []

    const membershipsToBe =
      data.channels
        ?.map((channel) => {
          const c = newsChannels.find(
            (i) => i.channelName.toLowerCase() === channel.toLowerCase()
          )
          return c?.GroupId ?? ""
        })
        .filter((i) => i !== "") ?? []

    const membershipsToRemove = oldMemberShips.filter(
      (i) => !membershipsToBe.includes(i)
    )

    const membershipsToAdd = membershipsToBe.filter(
      (i) => !oldMemberShips.includes(i)
    )

    localStorage.setItem(
      "user",
      JSON.stringify({ country: data.country, unit: data.unit })
    )
    //TODO: Implemene saveProfile
    // const redirectto = await saveProfile(
    //   magicbox.user?.id ?? "",
    //   data.country,
    //   data.unit,
    //   membershipsToAdd,
    //   membershipsToRemove
    // )


    //setlastResult(redirectto)

    setProcessPercentage(100)
    setProcessDescription("Profile saved, you will be redirected.")
    await new Promise((r) => setTimeout(r, 1500))

    // setProcessing(false)
    //window.open(redirectto.href, redirectto.target)
  }

  const watchUnit = form.watch("unit", "")
  const watchCountry = form.watch("country", "")
  const watchChannels = form.watch("channels", [])

  useEffect(() => {
    form.setValue(
      "channels",
      memberships?.length === 0
        ? getDefultChannels(props.currentCountry, props.currentUnit).map(
          (i) => i.channelName
        )
        : stringMemberships
    )
  }, [newsChannels, props.currentUnit, props.currentCountry, stringMemberships])

  useEffect(() => {
    form.setValue(
      "channels",
      getDefultChannels(watchCountry, watchUnit).map((i) => i.channelName)
    )
  }, [watchCountry, watchUnit])

  if (magicbox.session === null) {
    return <div>no access</div>
  }

  return (
    <div className="flex">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="flex flex-col pb-[30px]">
                  <FormLabel>Business Unit / Group Function</FormLabel>
                  <Popover open={showUnits} onOpenChange={setshowUnits}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[400px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? units.find(
                              (unit) =>
                                unit.unitName.toLowerCase() === field.value
                            )?.unitName
                            : "Select unit"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px]  p-0">
                      <Command>
                        <CommandInput placeholder="Search units..." />
                        <CommandList>
                          <CommandEmpty>No unit found.</CommandEmpty>
                          <CommandGroup heading="Business Units">
                            {units
                              .filter(
                                (unit) => unit.unitType === "Business Unit"
                              )
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((unit) => (
                                <CommandItem
                                  value={unit.unitName}
                                  key={unit.unitName}
                                  onSelect={(value) => {
                                    form.setValue("unit", value)
                                    //setkeepOld(false)
                                    setshowUnits(false)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      unit.unitName === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {unit.unitName}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup heading="Group Functions">
                            {units
                              .filter(
                                (unit) => unit.unitType === "Group Function"
                              )
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((unit) => (
                                <CommandItem
                                  value={unit.unitName}
                                  key={unit.unitName}
                                  onSelect={(value) => {
                                    form.setValue("unit", value)
                                    setshowUnits(false)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      unit.unitName === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {unit.unitName}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the unit which will be used for tailoring your
                    experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="flex flex-col pb-[30px]">
                  <FormLabel>Country / Region</FormLabel>
                  <Popover open={showCountries} onOpenChange={setshowCountries}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[400px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? countries.find(
                              (country) =>
                                country.countryName.toLowerCase() ===
                                field.value
                            )?.countryName
                            : "Select country"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className=" p-0">
                      <Command>
                        <CommandInput placeholder="Search countries..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries
                              .sort((a, b) => {
                                if (a.countryName > b.countryName) return 1
                                if (a.countryName < b.countryName) return -1
                                return 0
                              })
                              .map((country) => (
                                <CommandItem
                                  value={country.countryName}
                                  key={country.countryName}
                                  onSelect={(value) => {
                                    form.setValue("country", value)
                                    //setkeepOld(false)
                                    setshowCountries(false)
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country.countryName === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.countryName}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the country which will be used for tailoring your
                    experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channels"
              render={({ field }) => (
                <FormItem className="flex flex-col pb-[30px]">
                  <FormLabel>News Channels</FormLabel>
                  <Popover open={showChannels} onOpenChange={setshowChannels}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "h-max w-[400px] justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {/* <NewsChannels country={watchCountry} unit={watchUnit} channels={newsChannels} /> */}
                          {field.value ? (
                            <div className="flex flex-wrap gap-1">
                              {field.value.map((val) => {
                                return (
                                  <div
                                    key={val}
                                    className=" max-h-7 rounded-sm bg-black p-1 px-3 text-sm font-light text-white"
                                  >
                                    {val.substring(0, 14)}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            "Select news channels"
                          )}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className=" p-0">
                      <Command>
                        <CommandInput placeholder="Search channels..." />

                        <CommandEmpty>No channels found.</CommandEmpty>
                        <CommandList className="max-h-[400px] overflow-scroll">
                          {newsCategories
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((category, key) => {
                              return (
                                <CommandGroup
                                  key={key}
                                  heading={category.categoryName}
                                >
                                  {newsChannels
                                    .filter(
                                      (i) =>
                                        i.NewsCategoryId === category.categoryId
                                    )
                                    .sort((a, b) => {
                                      if (
                                        a.sortOrder.toLowerCase() <
                                        b.sortOrder.toLowerCase()
                                      ) {
                                        return -1
                                      }
                                      if (
                                        a.sortOrder.toLowerCase() >
                                        b.sortOrder.toLowerCase()
                                      ) {
                                        return 1
                                      }
                                      return 0
                                    })
                                    .map((channel) => (
                                      <CommandItem
                                        value={channel.channelName}
                                        key={channel.channelCode}
                                        onSelect={(value) => {
                                          if (channel.Mandatory) return

                                          let newvalue = []
                                          if (
                                            field.value?.includes(
                                              channel.channelName
                                            )
                                          ) {
                                            newvalue = field.value?.filter(
                                              (i) => i !== channel.channelName
                                            )
                                          } else {
                                            newvalue = [
                                              ...(field.value ?? []),
                                              channel.channelName,
                                            ]
                                          }
                                          form.setValue("channels", newvalue)
                                        }}
                                      >
                                        {channel.Mandatory && (
                                          <LockClosedIcon
                                            className={"mr-2 h-4"}
                                          />
                                        )}
                                        {!channel.Mandatory && (
                                          <CheckIcon
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value?.includes(
                                                channel.channelName
                                              )
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        )}
                                        {channel.channelName}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              )
                            })}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the news channels that you subscribe to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keep"
                checked={keepOld}
                onCheckedChange={() => setkeepOld(!keepOld)}
              />

              <label
                htmlFor="keep"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep previously subscribed channels
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              watchUnit === undefined ||
              watchUnit === "" ||
              watchCountry === undefined ||
              watchCountry === ""
            }
          >
            Save profile
          </Button>
        </form>
      </Form>
      <ProcessStatusOverlay
        done={!processing}
        title={processTitle}
        description={processDescription}
        progress={processPercentage}
      />
      {false && memberships && (
        <div className="ml-5">
          <div className="text-xl">Current Office 365 Group memberships</div>

          <GenericTable
            data={(memberships ?? [])

              .sort((a, b) => {
                if (a.groupDisplayName > b.groupDisplayName) return 1
                if (a.groupDisplayName < b.groupDisplayName) return -1
                return 0
              })
              .map((membership, key) => {
                const item: GenericItem<any> = {
                  link:
                    "https://portal.azure.com/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Members/groupId/" +
                    membership.groupId,
                  id: membership.groupId,
                  details: membership.groupId,
                  title: membership.groupDisplayName,
                  string1: undefined,
                  string2: undefined,
                  string3: undefined,
                }
                return item
              })}
          />
        </div>
      )}
      {/* <div>
        <pre>{JSON.stringify({ watchUnit, watchCountry,lastResult },null,2)}</pre>
      </div> */}
    </div>
  )

  function getDefultChannels(country: string, unit: string) {
    const defaults: NewsChannel[] = []
    newsChannels.forEach((channel) => {
      if (channel.Mandatory) {
        defaults.push(channel)
        return
      }

      if (match(channel, unit, country)) {
        defaults.push(channel)
        return
      }
    })
    return defaults
  }
}
