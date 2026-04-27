"use client"

import { useEffect, useState } from "react"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { RefreshCw, Users, ShieldCheck } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  inventory_manager: "bg-blue-100 text-blue-700",
  end_user: "bg-green-100 text-green-700",
}

const ROLE_LABELS: Record<string, string> = {
  admin: "System Administrator",
  inventory_manager: "Inventory Manager",
  end_user: "End-User",
}

const DEMO_USERS = [
  { email: "dev@openclaw.local", name: "Dev Admin", role: "admin" },
  { email: "admin@demo.local", name: "System Admin", role: "admin" },
  { email: "dev@demo.local", name: "Inventory Manager", role: "inventory_manager" },
  { email: "manager@demo.local", name: "Supply Officer", role: "inventory_manager" },
  { email: "tester@demo.local", name: "End User Tester", role: "end_user" },
  { email: "viewer@demo.local", name: "Viewer", role: "end_user" },
]

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setCurrentUser(data?.user)
      if (data?.user?.role !== "admin") {
        router.push("/dashboard")
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  if (currentUser?.role !== "admin") return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage system users and role assignments</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              {
                role: "System Administrator",
                color: "border-red-200 bg-red-50",
                permissions: [
                  "Full CRUD on all entities",
                  "Delete any record",
                  "Manage user accounts",
                  "Generate all reports",
                  "View audit logs",
                  "Approve/reject PRs",
                ],
              },
              {
                role: "Inventory Manager",
                color: "border-blue-200 bg-blue-50",
                permissions: [
                  "Add/update inventory items",
                  "Process RIS records",
                  "Approve/reject PRs",
                  "Manage property receipts",
                  "Generate all reports",
                  "View audit logs",
                ],
              },
              {
                role: "End-User",
                color: "border-green-200 bg-green-50",
                permissions: [
                  "View inventory items",
                  "Submit purchase requests",
                  "View own RIS records",
                  "View property receipts",
                  "View basic reports",
                  "No delete access",
                ],
              },
            ].map(p => (
              <div key={p.role} className={`rounded-lg border p-4 ${p.color}`}>
                <h3 className="font-semibold mb-2">{p.role}</h3>
                <ul className="space-y-1">
                  {p.permissions.map(perm => (
                    <li key={perm} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Demo Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Role</th>
                  <th className="text-left py-2 px-3">Password</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map(user => (
                  <tr key={user.email} className="border-t hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{user.name}</td>
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{user.email}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || ""}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">DevAccess123!</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            These are demo accounts for testing purposes. In production, users would be managed through a proper admin interface with role assignment workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
