"use client"

import * as React from "react"
import { sidebarData } from '@/app/sidebar-data'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { Sun, Moon, ChevronsUpDown, Plus, ChevronRight } from 'lucide-react'
import { Icon } from "./icon"
import Link from "next/link"

import { useContext } from "react"

import GlobalBreadcrumb from "./global-breadcrumb"
import { ShareComponent } from "./share-component"

// Custom hook to detect if running in an iframe
import { BRANCH } from '@/branch'
import { APPDISPLAYNAME } from '@/app/global'
import Image from "next/image"
import { SupportedLanguage, useLanguage } from "@/contexts/language-context"
import { useIsInIframe } from "@/hooks/use-isiniframe"
import { MagicboxContext } from "@/contexts/magicbox-context"


function appName() {
  const branch = BRANCH
  if ((branch === "master") || (branch === "main")) {
    return APPDISPLAYNAME
  }
  else {
    return APPDISPLAYNAME + " (" + branch.toUpperCase() + " VERSION)"
  }

}


function MenuItemLabel(props: { title: string, label?: string }) {
  const { title, label } = props
  return <div className="flex">
    <div>{title}</div>
    <span className="grow" />
    {label && <span className="bg-yellow-400">{label}</span>}
  </div>
}
interface ApplicationRootProps {
  children: React.ReactNode
  topnav?: React.ReactNode;
  hideTopNav?: boolean
  hideBreadcrumb?: boolean
  hideSidebar?: boolean
}

const translations = {
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
  },
};

const TopNavigation: React.FC<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  t: typeof translations[SupportedLanguage];
}> = ({ isDarkMode, toggleDarkMode, language, changeLanguage, t }) => (
  <div className="flex items-center space-x-4">
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? t.lightMode : t.darkMode}
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>


    <ShareComponent subscriberCount={0} onShare={function (args_0: string, ...args: unknown[]): void {
      //throw new Error('Function not implemented.')
    }} onCreatePost={function (...args: unknown[]): void {
      //throw new Error('Function not implemented.')
    }} />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {t.language}
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('da')}>Dansk</DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('it')}>Italian</DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export const ApplicationRoot: React.FC<ApplicationRootProps> = ({
  children,
  topnav,
  hideTopNav = false,
  hideBreadcrumb = false,
  hideSidebar = false
}) => {
  const isInIframe = useIsInIframe()
  const magicbox = useContext(MagicboxContext)
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const { language, setLanguage } = useLanguage()
  const [activeTeam, setActiveTeam] = React.useState(sidebarData.teams[0])

  const t = translations[language]

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const changeLanguage = (lang: SupportedLanguage) => {

    setLanguage(lang)
    //setlanguage(lang)
  }

  return (


    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''} bg-background text-foreground`}>
      {!hideTopNav && !isInIframe && magicbox.appMode !== "app" && (
        <div className="absolute top-0 right-0 p-4 z-50 flex" >
          {topnav}
          <TopNavigation
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            language={language}
            changeLanguage={changeLanguage}
            t={t}
          />
        </div>
      )}
      <SidebarProvider>
        {!hideSidebar && !isInIframe && magicbox.appMode !== "app" && (
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          <Image src="/tool-white.svg" width={64} height={64} alt="icon" className="w-6 h-6" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {APPDISPLAYNAME}
                          </span>
                          <span className="truncate text-xs">
                            {BRANCH}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {t.teams}
                      </DropdownMenuLabel>
                      <DropdownMenuItem


                        className="gap-2 p-2"
                      >

                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Image src="/appimages/ios/64.png" width={64} height={64} alt="icon" className="w-6 h-6" />

                        </div>
                        <Link className="grow" href="https://tools.intra.nexigroup.com">
                          Production
                        </Link>

                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem


                        className="gap-2 p-2"
                      >

                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Image src="/appimages/ios/64.png" width={64} height={64} alt="icon" className="w-6 h-6" />
                        </div>
                        <Link className="grow" href="https://nexi-intra-nexi-toolsv2-canary.intra.nexigroup.com">
                          Canary
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem


                        className="gap-2 p-2"
                      >

                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Image src="/appimages/ios/64.png" width={64} height={64} alt="icon" className="w-6 h-6" />
                        </div>
                        <Link className="grow" href="https://nexi-intra-nexi-toolsv2-alpha.intra.nexigroup.com">
                          Alpha
                        </Link>

                      </DropdownMenuItem>
                      <DropdownMenuItem


                        className="gap-2 p-2"
                      >

                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Image src="/appimages/ios/64.png" width={64} height={64} alt="icon" className="w-6 h-6" />
                        </div>
                        <Link className="grow" href="https://nexi-intra-nexi-toolsv2-beta.intra.nexigroup.com">
                          Beta
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem


                        className="gap-2 p-2"
                      >

                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Image src="/appimages/ios/64.png" width={64} height={64} alt="icon" className="w-6 h-6" />
                        </div>
                        <Link className="grow" href="https://nexi-intra-nexi-toolsv2-master.intra.nexigroup.com">
                          Master
                        </Link>

                      </DropdownMenuItem>
                      {/* <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                              <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">
                              {t.addTeam}
                            </div>
                          </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>{t.platform}</SidebarGroupLabel>
                <SidebarMenu>
                  {sidebarData.navMain.map((item: any) => (
                    <Collapsible
                      key={item.title.en}
                      asChild
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title[language]}>
                            <Icon iconName={item.icon} className="size-5" />
                            <span>{item.title[language]}</span>
                            {item.label && <span className="bg-yellow-400">{item.label}</span>}
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem: any) => (
                              <SidebarMenuSubItem key={subItem.title.en}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.url}>

                                    <span>{subItem.title[language]} </span>
                                    {subItem.label && <span className="bg-yellow-400">{subItem.label}</span>}

                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup className="hidden group-data-[collapsible=icon]:hidden ">
                <SidebarGroupLabel>{t.projects}</SidebarGroupLabel>
                <SidebarMenu>
                  {sidebarData.projects.map((item: any) => (
                    <SidebarMenuItem key={item.title.en}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <Icon iconName={item.icon} className="size-5" />
                          <span>{item?.title[language]}</span>
                        </Link>
                      </SidebarMenuButton>
                      {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover>
                            <Icon iconName={item.moreIcon} className="size-5" />
                            <span className="sr-only">{t.more}</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-48 rounded-lg"
                          side="bottom"
                          align="end"
                        >
                          {item.actions.map((action) => (
                            <DropdownMenuItem key={action.label.en}>
                              <Icon iconName={action.icon} className="size-5" />
                              <span>{action.label[language]}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-sidebar-foreground/70">
                      {sidebarData.moreProjectsIcon}
                      <span>{t.more}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={magicbox.user?.image}
                            alt={magicbox.user?.name}
                          />
                          <AvatarFallback className="rounded-lg">
                            {magicbox.user?.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {!magicbox.authtoken && <div className="text-red-500">!</div>}
                            {magicbox.user?.name}
                          </span>
                          <span className="truncate text-xs">
                            {magicbox.user?.email}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                      side="bottom"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage
                              src={magicbox.user?.image}
                              alt={magicbox.user?.name}
                            />
                            <AvatarFallback className="rounded-lg">
                              {magicbox.user?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                              {magicbox.user?.name}
                            </span>
                            <span className="truncate text-xs">
                              {magicbox.user?.email}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>
                          {magicbox.user?.roles.join(', ')}
                        </DropdownMenuLabel>
                        {sidebarData.userMenuItems.map((item: any) => (
                          <DropdownMenuItem key={item.label.en}>
                            <Icon iconName={item.icon} className="size-5" />
                            {item.label[language]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
        )}

        <SidebarInset>
          {!isInIframe && magicbox.appMode !== "app" && (
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />

                <Separator orientation="vertical" className="mr-2 h-4" />
                {!isInIframe && <GlobalBreadcrumb />}
                {/* <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">
                          {t.buildingYourApplication}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{t.dataFetching}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb> */}

              </div>
            </header>)}

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min w-full">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      {/* <pre>
        {JSON.stringify(sidebarData.navMain, null, 2)}

      </pre> */}
    </div>

  )
}