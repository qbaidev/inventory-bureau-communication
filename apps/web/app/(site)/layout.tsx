"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { authClient } from "@/services/better-auth/auth-client"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowRightLeft,
  FileText,
  BarChart3,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory Items", icon: Package },
  { href: "/purchase-requests", label: "Purchase Requests", icon: ShoppingCart },
  { href: "/ris", label: "Requisition & Issue", icon: ArrowRightLeft },
  { href: "/property", label: "Property Management", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
]

const ADMIN_NAV = [
  { href: "/users", label: "User Management", icon: Users },
]

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  const isAdmin = user?.role === "admin"
  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV] : NAV_ITEMS

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/")
    const Icon = item.icon
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] border border-[var(--sidebar-primary)]/30"
            : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[var(--sidebar-primary)]" : ""}`} />
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && active && <ChevronRight className="h-3 w-3 ml-auto text-[var(--sidebar-primary)]" />}
      </Link>
    )
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${mobile ? "w-64" : collapsed ? "w-16" : "w-64"} transition-all duration-200`}
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-[var(--sidebar-border)]`}>
        <div className="shrink-0">
          <svg width="36" height="36" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="72" height="72" rx="10" fill="oklch(0.37 0.19 264)" />
            <line x1="36" y1="52" x2="36" y2="22" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="28" y1="52" x2="44" y2="52" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="20" y1="52" x2="28" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="44" y1="52" x2="52" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M26 34 Q36 24 46 34" stroke="oklch(0.87 0.17 87)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M22 30 Q36 16 50 30" stroke="oklch(0.87 0.17 87)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
            <circle cx="36" cy="22" r="3" fill="oklch(0.87 0.17 87)"/>
          </svg>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">BCS Inventory</div>
            <div className="text-xs text-white/50 truncate">Management System</div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-white/40 hover:text-white/80 shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {allNavItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-[var(--sidebar-border)] p-3">
        {(!collapsed || mobile) && user && (
          <div className="mb-2 px-1">
            <div className="text-xs font-medium text-white truncate">{user.name || user.email}</div>
            <div className="text-xs text-white/40 capitalize">{user.role?.replace("_", " ") || "User"}</div>
          </div>
        )}
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 transition-colors mb-1"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {(!collapsed || mobile) && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 flex-col border-r border-border">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-[var(--sidebar)]">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-white font-semibold text-sm">BCS Inventory System</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
          © 2026 BCS Inventory Management System. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
