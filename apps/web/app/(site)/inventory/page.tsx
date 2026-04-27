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
import { Plus, Search, Trash2, Edit2, Barcode, RefreshCw } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const TYPE_LABELS: Record<string, string> = {
  supplies_materials: "Supplies & Materials",
  semi_expendable: "Semi-Expendable",
  ppe: "PPE",
}

const CONDITION_COLORS: Record<string, string> = {
  serviceable: "bg-green-100 text-green-700",
  unserviceable: "bg-yellow-100 text-yellow-700",
  for_disposal: "bg-red-100 text-red-700",
}

function ItemForm({ item, onSave, onClose }: any) {
  const [form, setForm] = useState(item || {
    name: "", description: "", type: "supplies_materials", unit: "piece",
    quantity: 0, unitCost: "0", location: "", condition: "serviceable",
    batchNumber: "", lifespanYears: "", depreciationRate: "0",
  })
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const bookValue = String(parseFloat(form.unitCost || "0") * parseInt(form.quantity || "0"))
      const url = item ? `${API}/v1/inventory-items/${item.id}` : `${API}/v1/inventory-items`
      const method = item ? "PUT" : "POST"
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, bookValue }),
      })
      onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1"><Label>Item Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="space-y-1"><Label>Type *</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="supplies_materials">Supplies & Materials</SelectItem>
              <SelectItem value="semi_expendable">Semi-Expendable</SelectItem>
              <SelectItem value="ppe">PPE (Property, Plant & Equipment)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Unit</Label><Input value={form.unit} onChange={e => set("unit", e.target.value)} /></div>
        <div className="space-y-1"><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)} /></div>
        <div className="space-y-1"><Label>Unit Cost (₱)</Label><Input type="number" step="0.01" value={form.unitCost} onChange={e => set("unitCost", e.target.value)} /></div>
        <div className="space-y-1"><Label>Location</Label><Input value={form.location} onChange={e => set("location", e.target.value)} /></div>
        <div className="space-y-1"><Label>Condition</Label>
          <Select value={form.condition} onValueChange={v => set("condition", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="serviceable">Serviceable</SelectItem>
              <SelectItem value="unserviceable">Unserviceable</SelectItem>
              <SelectItem value="for_disposal">For Disposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Batch Number</Label><Input value={form.batchNumber} onChange={e => set("batchNumber", e.target.value)} /></div>
        <div className="space-y-1"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""} onChange={e => set("expiryDate", e.target.value)} /></div>
        {(form.type === "semi_expendable" || form.type === "ppe") && (
          <>
            <div className="space-y-1"><Label>Lifespan (years)</Label><Input type="number" value={form.lifespanYears} onChange={e => set("lifespanYears", e.target.value)} /></div>
            <div className="space-y-1"><Label>Depreciation Rate (%)</Label><Input type="number" step="0.01" value={form.depreciationRate} onChange={e => set("depreciationRate", e.target.value)} /></div>
          </>
        )}
        <div className="col-span-2 space-y-1"><Label>Description</Label><Input value={form.description} onChange={e => set("description", e.target.value)} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !form.name}>
          {saving ? "Saving..." : item ? "Update Item" : "Add Item"}
        </Button>
      </DialogFooter>
    </div>
  )
}

function ItemsTable({ items, isAdmin, onEdit, onDelete, onRefresh }: any) {
  const [search, setSearch] = useState("")
  const [barcodeSearch, setBarcodeSearch] = useState("")
  const [barcodeResult, setBarcodeResult] = useState<any>(null)

  const filtered = items.filter((i: any) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.itemCode.toLowerCase().includes(search.toLowerCase())
  )

  const handleBarcodeScan = async () => {
    if (!barcodeSearch) return
    try {
      const res = await fetch(`${API}/v1/inventory-items/barcode/${barcodeSearch}`, { credentials: "include" })
      const data = await res.json()
      setBarcodeResult(data)
    } catch {
      setBarcodeResult({ error: "Not found" })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5">
          <Barcode className="h-4 w-4 text-muted-foreground" />
          <Input className="w-48" placeholder="Scan barcode..." value={barcodeSearch} onChange={e => setBarcodeSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBarcodeScan()} />
          <Button size="sm" variant="outline" onClick={handleBarcodeScan}>Scan</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {barcodeResult && (
        <div className={`p-3 rounded border text-sm ${barcodeResult.error ? "border-destructive bg-destructive/10 text-destructive" : "border-green-400 bg-green-50 text-green-800"}`}>
          {barcodeResult.error ? barcodeResult.error : `Found: ${barcodeResult.name} (${barcodeResult.itemCode}) — Qty: ${barcodeResult.quantity}`}
          <button className="ml-2 underline" onClick={() => setBarcodeResult(null)}>Clear</button>
        </div>
      )}

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-xs text-muted-foreground">
              <th className="text-left py-2 px-3">Item Code</th>
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Batch</th>
              <th className="text-left py-2 px-3">Expiry</th>
              <th className="text-right py-2 px-3">Qty</th>
              <th className="text-right py-2 px-3">Unit Cost</th>
              <th className="text-right py-2 px-3">Book Value</th>
              <th className="text-left py-2 px-3">Condition</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item: any) => {
              const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null
              const isExpiringSoon = expiryDate && (expiryDate.getTime() - Date.now()) < 30 * 86400000
              return (
                <tr key={item.id} className="border-t hover:bg-muted/30">
                  <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{item.itemCode}</td>
                  <td className="py-2 px-3 font-medium max-w-[180px] truncate">{item.name}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground">{item.batchNumber || "—"}</td>
                  <td className="py-2 px-3 text-xs">
                    {expiryDate ? (
                      <span className={isExpiringSoon ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {expiryDate.toLocaleDateString("en-PH")}
                        {isExpiringSoon && " ⚠"}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-2 px-3 text-right">{item.quantity}</td>
                  <td className="py-2 px-3 text-right">₱{parseFloat(item.unitCost || 0).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right">₱{parseFloat(item.bookValue || 0).toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONDITION_COLORS[item.condition] || ""}`}>
                      {item.condition?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(item)} className="h-7 w-7 p-0"><Edit2 className="h-3 w-3" /></Button>
                      {isAdmin && <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-muted-foreground text-sm">No items found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setIsAdmin(data?.user?.role === "admin")
    })
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const res = await fetch(`${API}/v1/inventory-items`, { credentials: "include" })
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inventory item?")) return
    await fetch(`${API}/v1/inventory-items/${id}`, { method: "DELETE", credentials: "include" })
    loadItems()
  }

  const byType = (type: string) => items.filter(i => i.type === type)

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Items</h1>
          <p className="text-muted-foreground text-sm">{items.length} total items across all categories</p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-2" />Add Item
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="supplies_materials">Supplies ({byType("supplies_materials").length})</TabsTrigger>
          <TabsTrigger value="semi_expendable">Semi-Expendable ({byType("semi_expendable").length})</TabsTrigger>
          <TabsTrigger value="ppe">PPE ({byType("ppe").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <ItemsTable items={items} isAdmin={isAdmin} onEdit={i => { setEditItem(i); setShowForm(true) }} onDelete={handleDelete} onRefresh={loadItems} />
        </TabsContent>
        <TabsContent value="supplies_materials" className="mt-4">
          <ItemsTable items={byType("supplies_materials")} isAdmin={isAdmin} onEdit={i => { setEditItem(i); setShowForm(true) }} onDelete={handleDelete} onRefresh={loadItems} />
        </TabsContent>
        <TabsContent value="semi_expendable" className="mt-4">
          <ItemsTable items={byType("semi_expendable")} isAdmin={isAdmin} onEdit={i => { setEditItem(i); setShowForm(true) }} onDelete={handleDelete} onRefresh={loadItems} />
        </TabsContent>
        <TabsContent value="ppe" className="mt-4">
          <ItemsTable items={byType("ppe")} isAdmin={isAdmin} onEdit={i => { setEditItem(i); setShowForm(true) }} onDelete={handleDelete} onRefresh={loadItems} />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <ItemForm item={editItem} onSave={() => { setShowForm(false); loadItems() }} onClose={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
