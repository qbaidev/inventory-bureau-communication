"use client"

import { useEffect, useState } from "react"
import { Button } from "@/core/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog"
import { Badge } from "@/core/components/ui/badge"
import { FileText, Printer, Download } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3014/api"

const REPORTS = [
  { code: "PR", name: "Purchase Request", desc: "All purchase requests with status and amounts" },
  { code: "RIS", name: "Requisition & Issue Slip", desc: "All RIS records with picking criteria" },
  { code: "PAR", name: "Property Acknowledgment Receipt", desc: "PAR records by custodian" },
  { code: "ICS", name: "Inventory Custodian Slip", desc: "ICS records by department" },
  { code: "IAR", name: "Inspection & Acceptance Report", desc: "Inspection records for received items" },
  { code: "RPCI", name: "Report on Physical Count (Inventories)", desc: "Physical count of supplies and semi-expendable" },
  { code: "RPCPPE", name: "Report on Physical Count (PPE)", desc: "Physical count of property, plant & equipment" },
  { code: "RSMI", name: "Report of Supplies & Materials Issued", desc: "Summary of supplies issued per period" },
  { code: "WMR", name: "Waste Material Report", desc: "Waste and scrap disposal records" },
  { code: "RLSDDP", name: "Registry of LSD & Disposal", desc: "Lost, stolen, destroyed or disposed properties" },
  { code: "PTR", name: "Property Transfer Report", desc: "Transfer of accountability between officers" },
  { code: "IIRUP", name: "Inventory & Inspection Report (Unserviceable)", desc: "Unserviceable properties for disposal" },
  { code: "PPELC", name: "PPE Ledger Card", desc: "Individual property ledger cards" },
  { code: "SPC", name: "Supplies Ledger Card", desc: "Individual supplies ledger cards" },
  { code: "SPLC", name: "Semi-Expendable Ledger Card", desc: "Semi-expendable property ledger cards" },
  { code: "RegSPI", name: "Registry of Semi-Permanent Items", desc: "Registry of all semi-permanent items" },
  { code: "ITR", name: "Inventory Transfer Report", desc: "Transfers between departments or units" },
  { code: "RRSP", name: "Registry of Regular Supplies & Property", desc: "Complete registry of supplies and property" },
  { code: "RSPI", name: "Report on Semi-Expendable Property Issued", desc: "Semi-expendable items issued per period" },
  { code: "RPCSP", name: "Report on Physical Count (Semi-Expendable)", desc: "Physical count of semi-expendable property" },
  { code: "RLSDDSP", name: "Registry of LSD (Semi-Expendable)", desc: "Lost, stolen or destroyed semi-expendable" },
  { code: "IIRUSP", name: "Inventory Report (Unserviceable Semi-Expendable)", desc: "Unserviceable semi-expendable for disposal" },
  { code: "SC", name: "Stock Card", desc: "Individual stock cards per inventory item" },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async (code: string) => {
    setLoading(true)
    setActiveReport(code)
    try {
      const res = await fetch(`${API}/v1/reports/${code}`, { credentials: "include" })
      const data = await res.json()
      setReportData(data)
    } catch {
      setReportData({ title: code, columns: ["Error"], rows: [["Failed to load report data"]] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">GAM Reports</h1>
        <p className="text-muted-foreground text-sm">Government Accounting Manual — {REPORTS.length} report types available</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map(r => (
          <Card key={r.code} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs font-mono shrink-0">{r.code}</Badge>
              </div>
              <h3 className="font-medium text-sm mb-1">{r.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{r.desc}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => generateReport(r.code)}
              >
                <FileText className="h-3 w-3 mr-1.5" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Viewer Dialog */}
      <Dialog open={!!activeReport} onOpenChange={() => { setActiveReport(null); setReportData(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{reportData?.title || activeReport}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : reportData ? (
            <div className="flex-1 overflow-hidden flex flex-col gap-3">
              {/* Controls */}
              <div className="flex gap-2 no-print">
                <Button size="sm" variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const csv = [reportData.columns, ...reportData.rows].map((r: string[]) => r.join(",")).join("\n")
                    const blob = new Blob([csv], { type: "text/csv" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a"); a.href = url; a.download = `${activeReport}.csv`; a.click()
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
              </div>

              {/* Government Report Header (print) */}
              <div className="print-only hidden text-center mb-4">
                <p className="text-xs">Republic of the Philippines</p>
                <p className="font-bold">Bureau of Communications Services</p>
                <p className="text-xs">Department of Information and Communications Technology</p>
                <p className="text-sm font-semibold mt-2">{reportData.title}</p>
              </div>

              {/* Table */}
              <div className="overflow-auto flex-1 border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-primary/10 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                      {reportData.columns.map((col: string, i: number) => (
                        <th key={i} className="text-left py-2 px-3 text-muted-foreground font-medium whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.length === 0 ? (
                      <tr><td colSpan={reportData.columns.length + 1} className="py-8 text-center text-muted-foreground">No data available</td></tr>
                    ) : reportData.rows.map((row: string[], i: number) => (
                      <tr key={i} className="border-t hover:bg-muted/30">
                        <td className="py-1.5 px-3 text-muted-foreground">{i + 1}</td>
                        {row.map((cell: string, j: number) => (
                          <td key={j} className="py-1.5 px-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.rows.length} record{reportData.rows.length !== 1 ? "s" : ""} — Generated {new Date().toLocaleDateString("en-PH")}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
