"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { authClient } from "@/services/better-auth/auth-client"
import { AlertCircle, ChevronDown, ChevronUp, LogIn } from "lucide-react"

const DEV_ACCOUNTS = [
  { email: "admin@demo.local", password: "DevAccess123!", role: "System Administrator", label: "Admin" },
  { email: "dev@openclaw.local", password: "DevAccess123!", role: "System Administrator", label: "Dev Admin" },
  { email: "dev@demo.local", password: "DevAccess123!", role: "Inventory Manager", label: "Inv. Manager" },
  { email: "manager@demo.local", password: "DevAccess123!", role: "Inventory Manager", label: "Supply Officer" },
  { email: "tester@demo.local", password: "DevAccess123!", role: "End-User", label: "End User" },
  { email: "viewer@demo.local", password: "DevAccess123!", role: "End-User", label: "Viewer" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)

  const handleLogin = async (e?: React.FormEvent, devEmail?: string, devPassword?: string) => {
    e?.preventDefault()
    const loginEmail = devEmail || email
    const loginPassword = devPassword || password
    if (!loginEmail || !loginPassword) return
    setLoading(true)
    setError("")
    try {
      const { error: authError } = await authClient.signIn.email({
        email: loginEmail,
        password: loginPassword,
        callbackURL: "/dashboard",
      })
      if (authError) {
        setError(authError.message || "Invalid credentials")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "oklch(0.18 0.08 264)" }}>
      {/* BCS background image at low opacity */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "url('/bcs-building.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.25 }}
      />
      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* BCS Logo + Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="72" height="72" rx="12" fill="oklch(0.37 0.19 264)" />
              {/* Signal tower */}
              <line x1="36" y1="52" x2="36" y2="22" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="28" y1="52" x2="36" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="44" y1="52" x2="36" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="20" y1="52" x2="28" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="44" y1="52" x2="52" y2="52" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Signal arcs */}
              <path d="M26 34 Q36 24 46 34" stroke="oklch(0.87 0.17 87)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M22 30 Q36 16 50 30" stroke="oklch(0.87 0.17 87)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
              <circle cx="36" cy="22" r="3" fill="oklch(0.87 0.17 87)"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BCS Inventory System</h1>
            <p className="text-sm text-white/60 mt-1">Bureau of Communications Services</p>
            <p className="text-xs text-white/40">Department of Information and Communications Technology</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-center text-foreground">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@bcs.gov.ph" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded p-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dev Access Panel */}
        <Card className="border border-white/20 bg-white/10 backdrop-blur-sm">
          <CardHeader className="pb-0 pt-3 px-4">
            <button
              type="button"
              className="flex items-center justify-between w-full text-white/80 hover:text-white text-sm font-medium"
              onClick={() => setShowDevPanel(!showDevPanel)}
            >
              <span>Demo Access — Quick Login</span>
              {showDevPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </CardHeader>
          {showDevPanel && (
            <CardContent className="pt-2 pb-3 px-4">
              <div className="grid grid-cols-2 gap-2">
                {DEV_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleLogin(undefined, acc.email, acc.password)}
                    disabled={loading}
                    className="text-left p-2 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <div className="text-white text-xs font-semibold">{acc.label}</div>
                    <div className="text-white/50 text-xs">{acc.role}</div>
                    <div className="text-white/40 text-xs truncate">{acc.email}</div>
                  </button>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-2 text-center">All passwords: DevAccess123!</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
