"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Badge } from "@/core/components/ui/badge"
import { RefreshCw, Search, Trash2 } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  APPROVE: "bg-purple-100 text-purple-700",
  REJECT: "bg-orange-100 text-orange-700",
  LOGIN: "bg-gray-100 text-gray-700",
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    authClient.getSession().then(({ data }) => setIsAdmin(data?.user?.role === "admin"))
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch(`${API}/v1/audit-logs`, { credentials: "include" })
    setLogs(await res.json())
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this audit log entry?")) return
    await fetch(`${API}/v1/audit-logs/${id}`, { method: "DELETE", credentials: "include" })
    load()
  }

  const filtered = logs.filter(l =>
    !search ||
    l.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">{logs.length} total log entries</p>
        </div>
        <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search by user, action, entity..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left py-2 px-3">Timestamp</th>
                <th className="text-left py-2 px-3">User</th>
                <th className="text-left py-2 px-3">Action</th>
                <th className="text-left py-2 px-3">Entity</th>
                <th className="text-left py-2 px-3">Details</th>
                <th className="text-left py-2 px-3">IP</th>
                {isAdmin && <th className="py-2 px-3"></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log: any) => (
                <tr key={log.id} className="border-t hover:bg-muted/30">
                  <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-PH")}
                  </td>
                  <td className="py-2 px-3 text-xs">{log.userEmail || "—"}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs capitalize">{log.entityType?.replace(/_/g, " ")}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{log.ipAddress || "—"}</td>
                  {isAdmin && (
                    <td className="py-2 px-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(log.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">No audit logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
