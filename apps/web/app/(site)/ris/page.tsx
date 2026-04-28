"use client"

import { useEffect, useState } from "react"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Badge } from "@/core/components/ui/badge"
import { Card, CardContent } from "@/core/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/core/components/ui/dialog"
import { Plus, Trash2, RefreshCw, Info } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  issued: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const CRITERIA_LABELS: Record<string, string> = {
  fifo: "FIFO — First In, First Out",
  lifo: "LIFO — Last In, First Out",
  fefo: "FEFO — First Expiry, First Out",
}

export default function RISPage() {
  const [records, setRecords] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [form, setForm] = useState({
    requestingOffice: "", purpose: "", issuedTo: "", issuedBy: "",
    pickingCriteria: "fifo", remarks: "",
    items: [{ inventoryItemId: "", quantity: 1, remarks: "" }],
  })

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setIsAdmin(data?.user?.role === "admin")
      if (data?.user) setForm(f => ({ ...f, issuedBy: data.user.name || data.user.email }))
    })
    load()
    loadInventory()
  }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch(`${API}/v1/ris-records`, { credentials: "include" })
    setRecords(await res.json())
    setLoading(false)
  }

  const loadInventory = async () => {
    const res = await fetch(`${API}/v1/inventory-items`, { credentials: "include" })
    setInventoryItems(await res.json())
  }

  const handleCreate = async () => {
    await fetch(`${API}/v1/ris-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    })
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this RIS record?")) return
    await fetch(`${API}/v1/ris-records/${id}`, { method: "DELETE", credentials: "include" })
    load()
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { inventoryItemId: "", quantity: 1, remarks: "" }] }))
  const setItem = (idx: number, k: string, v: any) => setForm(f => {
    const items = [...f.items]; items[idx] = { ...items[idx], [k]: v }; return { ...f, items }
  })

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requisition & Issue Slips</h1>
          <p className="text-muted-foreground text-sm">{records.length} RIS records</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => { loadInventory(); setShowForm(true) }}><Plus className="h-4 w-4 mr-2" />New RIS</Button>
        </div>
      </div>

      <div className="grid gap-3">
        {records.map((r: any) => (
          <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(r)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{r.risNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {r.pickingCriteria.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{r.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.requestingOffice} — Issued to: {r.issuedTo} by {r.issuedBy}
                  </p>
                  {r.remarks && <p className="text-xs text-muted-foreground italic mt-1">{r.remarks}</p>}
                </div>
                <div className="text-right shrink-0" onClick={e => e.stopPropagation()}>
                  <p className="text-xs text-muted-foreground">{new Date(r.issueDate).toLocaleDateString("en-PH")}</p>
                  {isAdmin && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive mt-2" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {records.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No RIS records yet.</p>}
      </div>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Requisition & Issue Slip</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg flex gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">PICKING CRITERIA</span> — FIFO issues oldest batches first, FEFO issues soonest-to-expire first, LIFO issues newest stock first.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Requesting Office *</Label><Input value={form.requestingOffice} onChange={e => setForm(f => ({ ...f, requestingOffice: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Issued To *</Label><Input value={form.issuedTo} onChange={e => setForm(f => ({ ...f, issuedTo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Issued By</Label><Input value={form.issuedBy} onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label>Picking Criteria</Label>
                <Select value={form.pickingCriteria} onValueChange={v => setForm(f => ({ ...f, pickingCriteria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO — FIRST IN, FIRST OUT</SelectItem>
                    <SelectItem value="lifo">LIFO — LAST IN, FIRST OUT</SelectItem>
                    <SelectItem value="fefo">FEFO — FIRST EXPIRY, FIRST OUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Purpose *</Label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Remarks</Label><Input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} /></div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items to Issue</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_32px] gap-2 items-center">
                    <Select value={item.inventoryItemId} onValueChange={v => setItem(idx, "inventoryItemId", v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={inventoryItems.length === 0 ? "Loading items..." : "Select item..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-muted-foreground">No items available</div>
                        ) : (
                          inventoryItems.map((i: any) => (
                            <SelectItem key={i.id} value={i.id}>
                              {i.name} ({i.itemCode}) — Qty: {i.quantity}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Qty" min={1} value={item.quantity} onChange={e => setItem(idx, "quantity", parseInt(e.target.value) || 1)} />
                    <button
                      type="button"
                      className="text-destructive hover:text-destructive/80 text-xs"
                      onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}
                      disabled={form.items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.requestingOffice || !form.purpose || !form.issuedTo}>Create RIS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.risNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Office:</span> {selected.requestingOffice}</div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[selected.status]}`}>{selected.status.toUpperCase()}</span></div>
                <div><span className="text-muted-foreground">Issued To:</span> {selected.issuedTo}</div>
                <div><span className="text-muted-foreground">Issued By:</span> {selected.issuedBy}</div>
                <div><span className="text-muted-foreground">Criteria:</span> <Badge variant="outline">{selected.pickingCriteria.toUpperCase()}</Badge></div>
                <div><span className="text-muted-foreground">Date:</span> {new Date(selected.issueDate).toLocaleDateString("en-PH")}</div>
              </div>
              <div><span className="text-muted-foreground">Purpose:</span> {selected.purpose}</div>
              {selected.remarks && <div><span className="text-muted-foreground">Remarks:</span> {selected.remarks}</div>}
              {selected.items?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Items Issued:</p>
                  <div className="space-y-1">
                    {selected.items.map((i: any) => {
                      const inv = inventoryItems.find((x: any) => x.id === i.inventoryItemId)
                      return (
                        <div key={i.id} className="text-xs border rounded p-2 flex justify-between items-start gap-2">
                          <div>
                            <p className="font-medium">{inv ? inv.name : "Unknown Item"}</p>
                            {inv && <p className="text-muted-foreground">{inv.itemCode}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p>Qty: <span className="font-medium">{i.quantity}</span></p>
                            {i.remarks && <p className="text-muted-foreground">{i.remarks}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
