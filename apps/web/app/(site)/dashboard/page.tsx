"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Badge } from "@/core/components/ui/badge"
import { Package, ShoppingCart, AlertTriangle, ArrowRightLeft, TrendingUp, Clock } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

function StatCard({ title, value, sub, icon: Icon, accent = false }: any) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${accent ? "bg-destructive/10" : "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${accent ? "text-destructive" : "text-primary"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [prStats, setPrStats] = useState<any>(null)
  const [risStats, setRisStats] = useState<any>(null)
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [expiring, setExpiring] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/v1/inventory-items/stats`).then(r => r.json()),
      fetch(`${API}/v1/purchase-requests/stats`).then(r => r.json()),
      fetch(`${API}/v1/ris-records/stats`).then(r => r.json()),
      fetch(`${API}/v1/inventory-items?limit=5`).then(r => r.json()),
      fetch(`${API}/v1/inventory-items/expiring?days=30`).then(r => r.json()),
    ]).then(([inv, pr, ris, items, exp]) => {
      setStats(inv)
      setPrStats(pr)
      setRisStats(ris)
      setRecentItems(Array.isArray(items) ? items.slice(0, 5) : [])
      setExpiring(Array.isArray(exp) ? exp : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* DEMO SYSTEM Banner */}
      <div className="w-full bg-red-600 text-white text-center py-2 px-4 rounded-md font-bold tracking-widest text-sm uppercase">
        DEMO SYSTEM - NOT FOR PRODUCTION USE
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Bureau of Communications Services — Inventory Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Inventory Items" value={stats?.total ?? 0} sub={`₱${(stats?.totalValue || 0).toLocaleString()} total value`} icon={Package} />
        <StatCard title="Expiring in 30 Days" value={expiring.length} sub="Requires immediate action" icon={AlertTriangle} accent={expiring.length > 0} />
        <StatCard title="Pending Purchase Requests" value={prStats?.submitted ?? 0} sub={`${prStats?.total ?? 0} total requests`} icon={ShoppingCart} />
        <StatCard title="RIS Records" value={risStats?.total ?? 0} sub={`${risStats?.pending ?? 0} pending issuance`} icon={ArrowRightLeft} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Inventory Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Supplies & Materials", value: stats?.supplies ?? 0, color: "bg-primary" },
              { label: "Semi-Expendable", value: stats?.semiExpendable ?? 0, color: "bg-secondary" },
              { label: "Property & Equipment", value: stats?.ppe ?? 0, color: "bg-chart-4" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${stats?.total ? (item.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PR Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              Purchase Request Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Draft", value: prStats?.draft ?? 0, variant: "secondary" as const },
              { label: "Submitted", value: prStats?.submitted ?? 0, variant: "default" as const },
              { label: "Approved", value: prStats?.approved ?? 0, variant: "default" as const },
              { label: "Rejected", value: prStats?.rejected ?? 0, variant: "destructive" as const },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <Badge variant={item.variant} className="text-xs">{item.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expiring Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              Expiring Soon (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items expiring within 30 days.</p>
            ) : (
              <div className="space-y-2">
                {expiring.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-foreground text-xs">{item.name}</p>
                      <p className="text-muted-foreground text-xs">{item.itemCode}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs shrink-0">
                      {new Date(item.expiryDate).toLocaleDateString("en-PH")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Inventory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4">Item Code</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Type</th>
                  <th className="text-right py-2 pr-4">Quantity</th>
                  <th className="text-right py-2">Book Value</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{item.itemCode}</td>
                    <td className="py-2 pr-4 font-medium">{item.name}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.type?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">₱{parseFloat(item.bookValue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
