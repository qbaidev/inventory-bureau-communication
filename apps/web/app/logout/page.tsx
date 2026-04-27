"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/services/better-auth/auth-client"

export default function LogoutPage() {
  const router = useRouter()
  useEffect(() => {
    authClient.signOut().then(() => router.push("/login"))
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Signing out...</p>
    </div>
  )
}
