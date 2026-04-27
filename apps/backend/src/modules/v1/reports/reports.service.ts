import { Injectable } from "@nestjs/common"
import { db } from "@repo/db"
import { inventoryItems, purchaseRequests, risRecords, propertyReceipts, auditLogs } from "@repo/db/schema"
import { desc } from "drizzle-orm"

@Injectable()
export class ReportsService {
  async getReportData(reportType: string) {
    switch (reportType) {
      case "PR": return this.getPRReport()
      case "RIS": return this.getRISReport()
      case "PAR": return this.getPARReport()
      case "ICS": return this.getICSReport()
      case "RPCI": return this.getRPCIReport()
      case "RSMI": return this.getRSMIReport()
      case "RRSP": return this.getRRSPReport()
      case "RPCPPE": return this.getRPCPPEReport()
      default: return this.getGenericReport(reportType)
    }
  }

  private async getPRReport() {
    const data = await db.select().from(purchaseRequests).orderBy(desc(purchaseRequests.requestDate))
    return {
      title: "Purchase Request Report",
      columns: ["PR Number", "Requesting Office", "Purpose", "Status", "Total Amount", "Request Date"],
      rows: data.map(r => [r.prNumber, r.requestingOffice, r.purpose, r.status.toUpperCase(), `₱${parseFloat(String(r.totalAmount || 0)).toLocaleString()}`, new Date(r.requestDate).toLocaleDateString("en-PH")])
    }
  }

  private async getRISReport() {
    const data = await db.select().from(risRecords).orderBy(desc(risRecords.issueDate))
    return {
      title: "Requisition and Issue Slip Report",
      columns: ["RIS Number", "Requesting Office", "Issued To", "Issued By", "Picking Criteria", "Status", "Issue Date"],
      rows: data.map(r => [r.risNumber, r.requestingOffice, r.issuedTo, r.issuedBy, r.pickingCriteria.toUpperCase(), r.status, new Date(r.issueDate).toLocaleDateString("en-PH")])
    }
  }

  private async getPARReport() {
    const data = (await db.select().from(propertyReceipts)).filter(r => r.type === "par")
    return {
      title: "Property Acknowledgment Receipt",
      columns: ["PAR Number", "Custodian", "Department", "Total Value", "Status", "Issue Date"],
      rows: data.map(r => [r.receiptNumber, r.custodian, r.department, `₱${parseFloat(String(r.totalValue || 0)).toLocaleString()}`, r.status, new Date(r.issueDate).toLocaleDateString("en-PH")])
    }
  }

  private async getICSReport() {
    const data = (await db.select().from(propertyReceipts)).filter(r => r.type === "ics")
    return {
      title: "Inventory Custodian Slip",
      columns: ["ICS Number", "Custodian", "Department", "Total Value", "Status", "Issue Date"],
      rows: data.map(r => [r.receiptNumber, r.custodian, r.department, `₱${parseFloat(String(r.totalValue || 0)).toLocaleString()}`, r.status, new Date(r.issueDate).toLocaleDateString("en-PH")])
    }
  }

  private async getRPCIReport() {
    const data = (await db.select().from(inventoryItems)).filter(i => i.type === "supplies_materials" || i.type === "semi_expendable")
    return {
      title: "Report on the Physical Count of Inventories (RPCI)",
      columns: ["Item Code", "Name", "Unit", "Quantity", "Unit Cost", "Total Value", "Condition"],
      rows: data.map(r => [r.itemCode, r.name, r.unit, r.quantity, `₱${parseFloat(String(r.unitCost || 0)).toLocaleString()}`, `₱${parseFloat(String(r.bookValue || 0)).toLocaleString()}`, r.condition])
    }
  }

  private async getRSMIReport() {
    const data = (await db.select().from(inventoryItems)).filter(i => i.type === "supplies_materials")
    return {
      title: "Report of Supplies and Materials Issued (RSMI)",
      columns: ["Item Code", "Name", "Unit", "Qty", "Unit Cost", "Amount", "Batch"],
      rows: data.map(r => [r.itemCode, r.name, r.unit, r.quantity, `₱${parseFloat(String(r.unitCost || 0)).toLocaleString()}`, `₱${parseFloat(String(r.bookValue || 0)).toLocaleString()}`, r.batchNumber || "N/A"])
    }
  }

  private async getRRSPReport() {
    const data = (await db.select().from(inventoryItems)).filter(i => i.type === "semi_expendable")
    return {
      title: "Registry of Regular Supplies and Property",
      columns: ["Item Code", "Name", "Unit", "Qty on Hand", "Unit Value", "Total Value", "Location"],
      rows: data.map(r => [r.itemCode, r.name, r.unit, r.quantity, `₱${parseFloat(String(r.unitCost || 0)).toLocaleString()}`, `₱${parseFloat(String(r.bookValue || 0)).toLocaleString()}`, r.location || "N/A"])
    }
  }

  private async getRPCPPEReport() {
    const data = (await db.select().from(inventoryItems)).filter(i => i.type === "ppe")
    return {
      title: "Report on Physical Count of PPE (RPCPPE)",
      columns: ["Item Code", "Name", "Acquisition Date", "Cost", "Depreciation Rate", "Book Value", "Condition"],
      rows: data.map(r => [r.itemCode, r.name, r.acquisitionDate ? new Date(r.acquisitionDate).toLocaleDateString("en-PH") : "N/A", `₱${parseFloat(String(r.unitCost || 0)).toLocaleString()}`, `${r.depreciationRate}%`, `₱${parseFloat(String(r.bookValue || 0)).toLocaleString()}`, r.condition])
    }
  }

  private async getGenericReport(type: string) {
    const items = await db.select().from(inventoryItems)
    return {
      title: `${type} Report`,
      columns: ["Item Code", "Name", "Type", "Quantity", "Unit Cost", "Book Value"],
      rows: items.map(r => [r.itemCode, r.name, r.type, r.quantity, `₱${parseFloat(String(r.unitCost || 0)).toLocaleString()}`, `₱${parseFloat(String(r.bookValue || 0)).toLocaleString()}`])
    }
  }
}
