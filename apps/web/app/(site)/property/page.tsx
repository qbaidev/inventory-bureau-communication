"use client"

import { useEffect, useState } from "react"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Badge } from "@/core/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/core/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs"
import { Plus, Trash2, RefreshCw, FileText } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

function ReceiptsTable({ receipts, isAdmin, onDelete, onView }: any) {
  if (receipts.length === 0) return <p className="text-center text-muted-foreground py-12 text-sm">No records found.</p>
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-xs text-muted-foreground">
            <th className="text-left py-2 px-3">Number</th>
            <th className="text-left py-2 px-3">Custodian</th>
            <th className="text-left py-2 px-3">Department</th>
            <th className="text-right py-2 px-3">Total Value</th>
            <th className="text-left py-2 px-3">Status</th>
            <th className="text-left py-2 px-3">Issue Date</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((r: any) => (
            <tr key={r.id} className="border-t hover:bg-muted/30">
              <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{r.receiptNumber}</td>
              <td className="py-2 px-3 font-medium">{r.custodian}</td>
              <td className="py-2 px-3 text-muted-foreground">{r.department}</td>
              <td className="py-2 px-3 text-right">₱{parseFloat(r.totalValue || 0).toLocaleString()}</td>
              <td className="py-2 px-3">
                <Badge variant={r.status === "active" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
              </td>
              <td className="py-2 px-3 text-xs text-muted-foreground">{new Date(r.issueDate).toLocaleDateString("en-PH")}</td>
              <td className="py-2 px-3">
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onView(r)}><FileText className="h-3 w-3" /></Button>
                  {isAdmin && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(r.id)}><Trash2 className="h-3 w-3" /></Button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PropertyPage() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [form, setForm] = useState({
    type: "par", custodian: "", department: "",
    items: [{ name: "", quantity: 1, unitCost: "0", description: "" }],
  })

  useEffect(() => {
    authClient.getSession().then(({ data }) => setIsAdmin(data?.user?.role === "admin"))
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch(`${API}/v1/property-receipts`, { credentials: "include" })
    setReceipts(await res.json())
    setLoading(false)
  }

  const handleCreate = async () => {
    const items = form.items.map(i => ({ ...i, totalCost: parseFloat(i.unitCost) * i.quantity }))
    await fetch(`${API}/v1/property-receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, items }),
    })
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property receipt?")) return
    await fetch(`${API}/v1/property-receipts/${id}`, { method: "DELETE", credentials: "include" })
    load()
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: "", quantity: 1, unitCost: "0", description: "" }] }))
  const setItem = (idx: number, k: string, v: any) => setForm(f => {
    const items = [...f.items]; items[idx] = { ...items[idx], [k]: v }; return { ...f, items }
  })

  const pars = receipts.filter(r => r.type === "par")
  const icss = receipts.filter(r => r.type === "ics")

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="text-muted-foreground text-sm">{receipts.length} property records (PAR + ICS)</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          {(isAdmin || true) && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />New Receipt</Button>}
        </div>
      </div>

      <Tabs defaultValue="par">
        <TabsList>
          <TabsTrigger value="par">PAR — Property Acknowledgment ({pars.length})</TabsTrigger>
          <TabsTrigger value="ics">ICS — Inventory Custodian ({icss.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="par" className="mt-4">
          <ReceiptsTable receipts={pars} isAdmin={isAdmin} onDelete={handleDelete} onView={setSelected} />
        </TabsContent>
        <TabsContent value="ics" className="mt-4">
          <ReceiptsTable receipts={icss} isAdmin={isAdmin} onDelete={handleDelete} onView={setSelected} />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Property Receipt</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Receipt Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="par">PAR — Property Acknowledgment Receipt</SelectItem>
                  <SelectItem value="ics">ICS — Inventory Custodian Slip</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Custodian *</Label><Input value={form.custodian} onChange={e => setForm(f => ({ ...f, custodian: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Department *</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-1"><Input placeholder="Item name" value={item.name} onChange={e => setItem(idx, "name", e.target.value)} /></div>
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => setItem(idx, "quantity", parseInt(e.target.value))} />
                  <Input type="number" placeholder="Unit cost" step="0.01" value={item.unitCost} onChange={e => setItem(idx, "unitCost", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.custodian || !form.department}>Create Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.receiptNumber}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Type:</span> {selected.type.toUpperCase()}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="default" className="text-xs">{selected.status}</Badge></div>
                <div><span className="text-muted-foreground">Custodian:</span> {selected.custodian}</div>
                <div><span className="text-muted-foreground">Department:</span> {selected.department}</div>
                <div><span className="text-muted-foreground">Total Value:</span> ₱{parseFloat(selected.totalValue || 0).toLocaleString()}</div>
                <div><span className="text-muted-foreground">Issue Date:</span> {new Date(selected.issueDate).toLocaleDateString("en-PH")}</div>
              </div>
              {selected.items?.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Items:</p>
                  <table className="w-full text-xs border rounded">
                    <thead className="bg-muted/50">
                      <tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Unit Cost</th></tr>
                    </thead>
                    <tbody>
                      {selected.items.map((i: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">{i.name}</td>
                          <td className="p-2 text-right">{i.quantity}</td>
                          <td className="p-2 text-right">₱{parseFloat(i.unitCost || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Button variant="outline" className="w-full no-print" onClick={() => window.print()}>
                <FileText className="h-4 w-4 mr-2" />Print Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
