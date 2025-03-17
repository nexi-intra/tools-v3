"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Layers, Key, FileText, Settings, Home, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Layers,
  },
  {
    title: "Endpoints",
    href: "/admin/endpoints",
    icon: Code2,
  },
  {
    title: "API Keys",
    href: "/admin/api-keys",
    icon: Key,
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Back to App",
    href: "/",
    icon: Home,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Microservice Broker</h2>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="flex-1 overflow-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/50",
                    pathname === item.href && "bg-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

