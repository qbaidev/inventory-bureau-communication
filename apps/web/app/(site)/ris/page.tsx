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

const CRITERIA_SHORT: Record<string, string> = {
  fifo: "FIFO",
  lifo: "LIFO",
  fefo: "FEFO",
}

const EMPTY_FORM = {
  requestingOffice: "", purpose: "", issuedTo: "", issuedBy: "",
  pickingCriteria: "fifo", remarks: "",
  items: [{ inventoryItemId: "", quantity: 1, remarks: "" }],
}

export default function RISPage() {
  const [records, setRecords] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [inventoryMap, setInventoryMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [detailRecord, setDetailRecord] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [issuedByDefault, setIssuedByDefault] = useState("")
  const [form, setForm] = useState({ ...EMPTY_FORM })

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setIsAdmin(data?.user?.role === "admin")
      if (data?.user) {
        const name = data.user.name || data.user.email
        setIssuedByDefault(name)
        setForm(f => ({ ...f, issuedBy: name }))
      }
    })
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/v1/ris-records`, { credentials: "include" })
      setRecords(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const loadInventory = async () => {
    setInventoryLoading(true)
    try {
      const res = await fetch(`${API}/v1/inventory-items`, { credentials: "include" })
      const arr = Array.isArray(await res.clone().json()) ? await res.json() : []
      setInventoryItems(arr)
      const map: Record<string, any> = {}
      arr.forEach((i: any) => { map[i.id] = i })
      setInventoryMap(map)
      return arr
    } catch {
      return []
    } finally {
      setInventoryLoading(false)
    }
  }

  const handleOpenForm = async () => {
    setForm({ ...EMPTY_FORM, issuedBy: issuedByDefault })
    await loadInventory()
    setShowForm(true)
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

  const addItem = () =>
    setForm(f => ({ ...f, items: [...f.items, { inventoryItemId: "", quantity: 1, remarks: "" }] }))

  const setItem = (idx: number, k: string, v: any) =>
    setForm(f => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [k]: v }
      return { ...f, items }
    })

  const removeItem = (idx: number) =>
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  const handleOpenDetail = async (r: any) => {
    setDetailRecord(r)
    if (Object.keys(inventoryMap).length === 0) await loadInventory()
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requisition & Issue Slips</h1>
          <p className="text-muted-foreground text-sm">{records.length} RIS records</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleOpenForm} disabled={inventoryLoading}>
            {inventoryLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Plus className="h-4 w-4" />New RIS
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Records list */}
      <div className="grid gap-3">
        {records.map((r: any) => (
          <Card
            key={r.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleOpenDetail(r)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground truncate">{r.risNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium shrink-0">
                      {(CRITERIA_SHORT[r.pickingCriteria] || r.pickingCriteria).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{r.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {r.requestingOffice} — Issued to: {r.issuedTo} by {r.issuedBy}
                  </p>
                  {r.remarks && (
                    <p className="text-xs text-muted-foreground italic mt-1 truncate">{r.remarks}</p>
                  )}
                </div>
                <div className="text-right shrink-0" onClick={e => e.stopPropagation()}>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.issueDate).toLocaleDateString("en-PH")}
                  </p>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive mt-2"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {records.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No RIS records yet.</p>
        )}
      </div>

      {/* ── Create Dialog ───────────────────────────────────────────── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Requisition & Issue Slip</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info banner */}
            <div className="p-3 bg-muted/50 rounded-lg flex gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">PICKING CRITERIA</span> — FIFO issues oldest batches
                first, FEFO issues soonest-to-expire first, LIFO issues newest stock first.
              </span>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Requesting Office *</Label>
                <Input
                  value={form.requestingOffice}
                  onChange={e => setForm(f => ({ ...f, requestingOffice: e.target.value }))}
                  placeholder="e.g. IT Division"
                />
              </div>
              <div className="space-y-1">
                <Label>Issued To *</Label>
                <Input
                  value={form.issuedTo}
                  onChange={e => setForm(f => ({ ...f, issuedTo: e.target.value }))}
                  placeholder="Recipient name"
                />
              </div>
              <div className="space-y-1">
                <Label>Issued By</Label>
                <Input
                  value={form.issuedBy}
                  onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Picking Criteria</Label>
                {/* SelectValue is required for Base UI to reflect the selection dynamically */}
                <Select
                  value={form.pickingCriteria}
                  onValueChange={v => setForm(f => ({ ...f, pickingCriteria: v }))}
                >
                  <SelectTrigger className="w-full uppercase font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fifo">FIFO — FIRST IN, FIRST OUT</SelectItem>
                    <SelectItem value="lifo">LIFO — LAST IN, FIRST OUT</SelectItem>
                    <SelectItem value="fefo">FEFO — FIRST EXPIRY, FIRST OUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Purpose *</Label>
              <Input
                value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                placeholder="Purpose of requisition"
              />
            </div>
            <div className="space-y-1">
              <Label>Remarks</Label>
              <Input
                value={form.remarks}
                onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder="Optional remarks"
              />
            </div>

            {/* Items to Issue */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items to Issue <span className="text-muted-foreground font-normal">({form.items.length})</span></Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3 mr-1" />Add Item
                </Button>
              </div>

              <div className="border rounded-lg divide-y overflow-hidden">
                {form.items.map((item, idx) => {
                  const inv = inventoryMap[item.inventoryItemId]
                  return (
                    <div key={idx} className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        {/* Item select — uses SelectValue so Base UI updates dynamically */}
                        <div className="flex-1 min-w-0">
                          <Select
                            value={item.inventoryItemId}
                            onValueChange={v => setItem(idx, "inventoryItemId", v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select inventory item..." />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">No items found</div>
                              ) : (
                                inventoryItems.map((i: any) => (
                                  <SelectItem key={i.id} value={i.id}>
                                    {i.name} ({i.itemCode})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Qty */}
                        <Input
                          type="number"
                          min={1}
                          max={inv?.quantity ?? undefined}
                          value={item.quantity}
                          onChange={e => setItem(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="w-20 shrink-0"
                          placeholder="Qty"
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          className="text-destructive hover:text-destructive/70 shrink-0 disabled:opacity-30 text-base leading-none"
                          onClick={() => removeItem(idx)}
                          disabled={form.items.length === 1}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Live sub-row: show selected item details */}
                      {inv && (
                        <div className="text-xs text-muted-foreground flex gap-4 pl-1">
                          <span>Code: <span className="font-medium">{inv.itemCode}</span></span>
                          <span>Available: <span className={`font-medium ${item.quantity > inv.quantity ? "text-destructive" : "text-green-600"}`}>{inv.quantity} {inv.unit}</span></span>
                          <span>Unit Cost: <span className="font-medium">₱{parseFloat(inv.unitCost).toLocaleString()}</span></span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.requestingOffice || !form.purpose || !form.issuedTo}
            >
              Create RIS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!detailRecord} onOpenChange={() => setDetailRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailRecord?.risNumber}</DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Office:</span> {detailRecord.requestingOffice}</div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[detailRecord.status]}`}>
                    {detailRecord.status.toUpperCase()}
                  </span>
                </div>
                <div><span className="text-muted-foreground">Issued To:</span> {detailRecord.issuedTo}</div>
                <div><span className="text-muted-foreground">Issued By:</span> {detailRecord.issuedBy}</div>
                <div>
                  <span className="text-muted-foreground">Criteria:</span>{" "}
                  <Badge variant="outline">
                    {(CRITERIA_SHORT[detailRecord.pickingCriteria] || detailRecord.pickingCriteria).toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {new Date(detailRecord.issueDate).toLocaleDateString("en-PH")}
                </div>
              </div>
              <div><span className="text-muted-foreground">Purpose:</span> {detailRecord.purpose}</div>
              {detailRecord.remarks && (
                <div><span className="text-muted-foreground">Remarks:</span> {detailRecord.remarks}</div>
              )}

              {detailRecord.items?.length > 0 ? (
                <div>
                  <p className="font-medium mb-2">Items Issued:</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {detailRecord.items.map((i: any) => {
                      const inv = inventoryMap[i.inventoryItemId]
                      return (
                        <div key={i.id} className="text-xs border rounded p-2 flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{inv ? inv.name : "Unknown Item"}</p>
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
              ) : (
                <p className="text-xs text-muted-foreground italic">No items recorded for this slip.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
