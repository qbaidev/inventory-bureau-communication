"use client"

import { useEffect, useState } from "react"
import { Button } from "@/core/components/ui/button"
import { Input } from "@/core/components/ui/input"
import { Label } from "@/core/components/ui/label"
import { Badge } from "@/core/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/core/components/ui/dialog"
import { Textarea } from "@/core/components/ui/textarea"
import { Plus, CheckCircle, XCircle, Trash2, RefreshCw, Send } from "lucide-react"
import { authClient } from "@/services/better-auth/auth-client"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default function PurchaseRequestsPage() {
  const [prs, setPrs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [form, setForm] = useState({
    requestingOffice: "", purpose: "", notes: "",
    requestedBy: "", items: [{ itemName: "", unit: "piece", quantity: 1, unitCost: "0", totalCost: "0" }],
  })

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      const role = data?.user?.role || ""
      setIsAdmin(role === "admin")
      setUserRole(role)
      if (data?.user) setForm(f => ({ ...f, requestedBy: data.user.name || data.user.email }))
    })
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch(`${API}/v1/purchase-requests`, { credentials: "include" })
    setPrs(await res.json())
    setLoading(false)
  }

  const handleCreate = async () => {
    const items = form.items.map(i => ({ ...i, totalCost: String(parseFloat(i.unitCost) * parseInt(String(i.quantity))) }))
    const totalAmount = items.reduce((s, i) => s + parseFloat(i.totalCost), 0)
    await fetch(`${API}/v1/purchase-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, items, totalAmount: String(totalAmount) }),
    })
    setShowForm(false)
    load()
  }

  const handleStatus = async (id: string, status: string) => {
    await fetch(`${API}/v1/purchase-requests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, approvedBy: "System Admin" }),
    })
    load()
  }

  const handleSubmit = async (id: string) => handleStatus(id, "submitted")
  const handleApprove = async (id: string) => handleStatus(id, "approved")
  const handleReject = async (id: string) => handleStatus(id, "rejected")

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase request?")) return
    await fetch(`${API}/v1/purchase-requests/${id}`, { method: "DELETE", credentials: "include" })
    load()
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { itemName: "", unit: "piece", quantity: 1, unitCost: "0", totalCost: "0" }] }))
  const setItem = (idx: number, k: string, v: any) => setForm(f => {
    const items = [...f.items]
    items[idx] = { ...items[idx], [k]: v }
    return { ...f, items }
  })

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Requests</h1>
          <p className="text-muted-foreground text-sm">{prs.length} total requests</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />New Request</Button>
        </div>
      </div>

      <div className="grid gap-3">
        {prs.map((pr: any) => (
          <Card key={pr.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(pr)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{pr.prNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[pr.status]}`}>
                      {pr.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{pr.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pr.requestingOffice} — by {pr.requestedBy}</p>
                  {pr.notes && <p className="text-xs text-muted-foreground italic mt-1">{pr.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">₱{parseFloat(pr.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(pr.requestDate).toLocaleDateString("en-PH")}</p>
                  <div className="flex gap-1 mt-2 justify-end" onClick={e => e.stopPropagation()}>
                    {pr.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSubmit(pr.id)}>
                        <Send className="h-3 w-3 mr-1" />Submit
                      </Button>
                    )}
                    {pr.status === "submitted" && (isAdmin || userRole === "inventory_manager") && (
                      <>
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(pr.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleReject(pr.id)}>
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                    {isAdmin && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(pr.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {prs.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No purchase requests yet.</p>}
      </div>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Purchase Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Requesting Office *</Label><Input value={form.requestingOffice} onChange={e => setForm(f => ({ ...f, requestingOffice: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Requested By</Label><Input value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Purpose *</Label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                  <div className="col-span-2"><Input placeholder="Item name" value={item.itemName} onChange={e => setItem(idx, "itemName", e.target.value)} /></div>
                  <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => setItem(idx, "quantity", e.target.value)} />
                  <Input placeholder="Unit cost" type="number" step="0.01" value={item.unitCost} onChange={e => setItem(idx, "unitCost", e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.requestingOffice || !form.purpose}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{selected?.prNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Office:</span> {selected.requestingOffice}</div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[selected.status]}`}>{selected.status.toUpperCase()}</span></div>
                <div><span className="text-muted-foreground">Requested by:</span> {selected.requestedBy}</div>
                <div><span className="text-muted-foreground">Total:</span> ₱{parseFloat(selected.totalAmount || 0).toLocaleString()}</div>
              </div>
              <div><span className="text-muted-foreground">Purpose:</span> {selected.purpose}</div>
              {selected.notes && <div><span className="text-muted-foreground">Notes:</span> {selected.notes}</div>}
              {selected.items?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Items:</p>
                  <table className="w-full text-xs border rounded">
                    <thead className="bg-muted/50"><tr><th className="text-left p-2">Item</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Unit Cost</th><th className="text-right p-2">Total</th></tr></thead>
                    <tbody>
                      {selected.items.map((i: any) => (
                        <tr key={i.id} className="border-t">
                          <td className="p-2">{i.itemName}</td>
                          <td className="p-2 text-right">{i.quantity}</td>
                          <td className="p-2 text-right">₱{parseFloat(i.unitCost || 0).toLocaleString()}</td>
                          <td className="p-2 text-right">₱{parseFloat(i.totalCost || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
