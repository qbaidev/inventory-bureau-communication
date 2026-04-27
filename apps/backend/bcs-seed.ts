import { db } from "@repo/db"
import {
  inventoryItems,
  purchaseRequests,
  prItems,
  risRecords,
  risItems,
  propertyReceipts,
  auditLogs,
} from "@repo/db/schema"

const API_URL = process.env.BETTER_AUTH_URL || "http://localhost:3014"

const DEMO_ACCOUNTS = [
  { email: "dev@openclaw.local", password: "DevAccess123!", name: "Dev Admin", role: "admin" },
  { email: "admin@demo.local", password: "DevAccess123!", name: "System Admin", role: "admin" },
  { email: "dev@demo.local", password: "DevAccess123!", name: "Inventory Manager", role: "inventory_manager" },
  { email: "manager@demo.local", password: "DevAccess123!", name: "Supply Officer", role: "inventory_manager" },
  { email: "tester@demo.local", password: "DevAccess123!", name: "End User Tester", role: "end_user" },
  { email: "viewer@demo.local", password: "DevAccess123!", name: "Viewer", role: "end_user" },
]

async function seedAccounts() {
  console.log("Seeding accounts...")
  for (const acc of DEMO_ACCOUNTS) {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acc.email, password: acc.password, name: acc.name, role: acc.role }),
      })
      const body = await res.json()
      console.log(`Account ${acc.email}: ${res.status}`)
    } catch (e: any) {
      console.log(`Account ${acc.email} failed: ${e.message}`)
    }
  }
}

async function seedInventory() {
  console.log("Seeding inventory items...")
  const now = new Date()
  const soon30 = new Date(now); soon30.setDate(soon30.getDate() + 30)
  const soon60 = new Date(now); soon60.setDate(soon60.getDate() + 60)
  const past6m = new Date(now); past6m.setMonth(past6m.getMonth() - 6)
  const past1y = new Date(now); past1y.setFullYear(past1y.getFullYear() - 1)
  const past2y = new Date(now); past2y.setFullYear(past2y.getFullYear() - 2)

  const items = [
    {
      itemCode: "BCS-SM-001",
      name: "Bond Paper (Short)",
      description: "70gsm bond paper, short size, 500 sheets/ream",
      type: "supplies_materials" as const,
      unit: "ream",
      quantity: 150,
      unitCost: "250.00",
      bookValue: "37500.00",
      batchNumber: "BTH-2026-001",
      expiryDate: soon60,
      barcode: "BCS-BARCODE-001",
      location: "Supply Room A",
      condition: "serviceable" as const,
      acquisitionDate: past6m,
    },
    {
      itemCode: "BCS-SM-002",
      name: "Ballpoint Pen (Black)",
      description: "0.7mm ballpoint pen, black ink, 12pcs/box",
      type: "supplies_materials" as const,
      unit: "box",
      quantity: 80,
      unitCost: "95.00",
      bookValue: "7600.00",
      batchNumber: "BTH-2026-002",
      expiryDate: null,
      barcode: "BCS-BARCODE-002",
      location: "Supply Room A",
      condition: "serviceable" as const,
      acquisitionDate: past6m,
    },
    {
      itemCode: "BCS-SM-003",
      name: "Correction Fluid",
      description: "20ml correction fluid, water-based",
      type: "supplies_materials" as const,
      unit: "bottle",
      quantity: 45,
      unitCost: "35.00",
      bookValue: "1575.00",
      batchNumber: "BTH-2026-003",
      expiryDate: soon30,
      barcode: "BCS-BARCODE-003",
      location: "Supply Room A",
      condition: "serviceable" as const,
      acquisitionDate: past6m,
    },
    {
      itemCode: "BCS-SM-004",
      name: "Toner Cartridge (HP 85A)",
      description: "HP 85A black toner cartridge, compatible",
      type: "supplies_materials" as const,
      unit: "piece",
      quantity: 12,
      unitCost: "1800.00",
      bookValue: "21600.00",
      batchNumber: "BTH-2026-004",
      expiryDate: null,
      barcode: "BCS-BARCODE-004",
      location: "IT Supply Cabinet",
      condition: "serviceable" as const,
      acquisitionDate: past6m,
    },
    {
      itemCode: "BCS-SE-001",
      name: "Desktop Calculator (Casio)",
      description: "12-digit desktop calculator, solar powered",
      type: "semi_expendable" as const,
      unit: "piece",
      quantity: 15,
      unitCost: "850.00",
      bookValue: "10200.00",
      batchNumber: "BTH-2025-010",
      expiryDate: null,
      barcode: "BCS-BARCODE-005",
      location: "Finance Office",
      condition: "serviceable" as const,
      lifespanYears: 5,
      acquisitionDate: past1y,
      depreciationRate: "20.00",
    },
    {
      itemCode: "BCS-SE-002",
      name: "Electric Fan (Stand Type)",
      description: "16-inch stand electric fan, oscillating",
      type: "semi_expendable" as const,
      unit: "piece",
      quantity: 8,
      unitCost: "2200.00",
      bookValue: "14080.00",
      batchNumber: "BTH-2025-011",
      expiryDate: null,
      barcode: "BCS-BARCODE-006",
      location: "General Office",
      condition: "serviceable" as const,
      lifespanYears: 5,
      acquisitionDate: past1y,
      depreciationRate: "20.00",
    },
    {
      itemCode: "BCS-SE-003",
      name: "Telephone Set",
      description: "Corded telephone set with caller ID",
      type: "semi_expendable" as const,
      unit: "unit",
      quantity: 10,
      unitCost: "1500.00",
      bookValue: "12000.00",
      batchNumber: "BTH-2024-020",
      expiryDate: null,
      barcode: "BCS-BARCODE-007",
      location: "Communications Room",
      condition: "serviceable" as const,
      lifespanYears: 5,
      acquisitionDate: past2y,
      depreciationRate: "20.00",
    },
    {
      itemCode: "BCS-PPE-001",
      name: "Desktop Computer (Dell OptiPlex)",
      description: "Intel Core i5, 8GB RAM, 256GB SSD, Win11 Pro",
      type: "ppe" as const,
      unit: "unit",
      quantity: 20,
      unitCost: "45000.00",
      bookValue: "720000.00",
      batchNumber: "BTH-2024-030",
      expiryDate: null,
      barcode: "BCS-BARCODE-008",
      location: "Main Office",
      condition: "serviceable" as const,
      lifespanYears: 5,
      acquisitionDate: past2y,
      depreciationRate: "20.00",
    },
    {
      itemCode: "BCS-PPE-002",
      name: "Laser Printer (HP LaserJet)",
      description: "HP LaserJet Pro M404dn, network-ready",
      type: "ppe" as const,
      unit: "unit",
      quantity: 6,
      unitCost: "18500.00",
      bookValue: "88800.00",
      batchNumber: "BTH-2024-031",
      expiryDate: null,
      barcode: "BCS-BARCODE-009",
      location: "Records Section",
      condition: "serviceable" as const,
      lifespanYears: 5,
      acquisitionDate: past2y,
      depreciationRate: "20.00",
    },
    {
      itemCode: "BCS-PPE-003",
      name: "Air Conditioning Unit (1.5HP)",
      description: "1.5HP window-type inverter aircon",
      type: "ppe" as const,
      unit: "unit",
      quantity: 4,
      unitCost: "28000.00",
      bookValue: "89600.00",
      batchNumber: "BTH-2023-040",
      expiryDate: null,
      barcode: "BCS-BARCODE-010",
      location: "Server Room",
      condition: "serviceable" as const,
      lifespanYears: 10,
      acquisitionDate: past2y,
      depreciationRate: "10.00",
    },
  ]

  const inserted = await db.insert(inventoryItems).values(items).returning()
  console.log(`Inserted ${inserted.length} inventory items`)
  return inserted
}

async function seedPurchaseRequests(itemIds: string[]) {
  console.log("Seeding purchase requests...")
  const prs = [
    {
      prNumber: "PR-2026-000001",
      requestingOffice: "Office of the Director",
      purpose: "Office supplies for Q1 2026",
      status: "approved" as const,
      requestedBy: "Juan dela Cruz",
      approvedBy: "Maria Santos",
      requestDate: new Date("2026-01-10"),
      approvalDate: new Date("2026-01-15"),
      totalAmount: "12500.00",
      notes: "Urgent — for Q1 operations",
    },
    {
      prNumber: "PR-2026-000002",
      requestingOffice: "Finance Division",
      purpose: "Replacement toner cartridges for photocopiers",
      status: "submitted" as const,
      requestedBy: "Ana Reyes",
      requestDate: new Date("2026-02-01"),
      totalAmount: "21600.00",
    },
    {
      prNumber: "PR-2026-000003",
      requestingOffice: "IT Division",
      purpose: "Computer accessories and peripherals",
      status: "submitted" as const,
      requestedBy: "Pedro Bautista",
      requestDate: new Date("2026-02-14"),
      totalAmount: "45000.00",
    },
    {
      prNumber: "PR-2026-000004",
      requestingOffice: "Records Section",
      purpose: "Filing cabinet and folders",
      status: "draft" as const,
      requestedBy: "Liza Mercado",
      requestDate: new Date("2026-03-01"),
      totalAmount: "8750.00",
    },
    {
      prNumber: "PR-2026-000005",
      requestingOffice: "Communications Office",
      purpose: "Network cables and accessories",
      status: "draft" as const,
      requestedBy: "Rico Fernandez",
      requestDate: new Date("2026-03-15"),
      totalAmount: "5500.00",
    },
    {
      prNumber: "PR-2026-000006",
      requestingOffice: "Administrative Division",
      purpose: "Janitorial supplies for April-June",
      status: "rejected" as const,
      requestedBy: "Carmen Villanueva",
      approvedBy: "Maria Santos",
      requestDate: new Date("2026-03-20"),
      approvalDate: new Date("2026-03-25"),
      totalAmount: "15000.00",
      notes: "Budget realignment needed — resubmit with updated cost",
    },
  ]

  const insertedPRs = []
  for (const pr of prs) {
    const [inserted] = await db.insert(purchaseRequests).values(pr).returning()
    insertedPRs.push(inserted)
  }

  // Add items to first PR
  await db.insert(prItems).values([
    { prId: insertedPRs[0].id, itemName: "Bond Paper (Short)", unit: "ream", quantity: 30, unitCost: "250.00", totalCost: "7500.00" },
    { prId: insertedPRs[0].id, itemName: "Ballpoint Pen (Black)", unit: "box", quantity: 10, unitCost: "95.00", totalCost: "950.00" },
    { prId: insertedPRs[0].id, itemName: "Correction Fluid", unit: "bottle", quantity: 20, unitCost: "35.00", totalCost: "700.00" },
  ])

  console.log(`Inserted ${insertedPRs.length} purchase requests`)
  return insertedPRs
}

async function seedRIS(inventoryItemIds: string[]) {
  console.log("Seeding RIS records...")
  const records = [
    { risNumber: "RIS-2026-000001", requestingOffice: "Office of the Director", purpose: "Office supplies replenishment", issuedTo: "Juan dela Cruz", issuedBy: "Supply Officer", pickingCriteria: "fifo" as const, status: "issued", issueDate: new Date("2026-01-20") },
    { risNumber: "RIS-2026-000002", requestingOffice: "Finance Division", purpose: "Toner cartridges for monthly reports", issuedTo: "Ana Reyes", issuedBy: "Supply Officer", pickingCriteria: "fefo" as const, status: "issued", issueDate: new Date("2026-02-05") },
    { risNumber: "RIS-2026-000003", requestingOffice: "IT Division", purpose: "Computer peripherals for new hires", issuedTo: "Pedro Bautista", issuedBy: "Supply Officer", pickingCriteria: "lifo" as const, status: "pending", issueDate: new Date("2026-02-20") },
    { risNumber: "RIS-2026-000004", requestingOffice: "Records Section", purpose: "Folders and filing materials", issuedTo: "Liza Mercado", issuedBy: "Supply Officer", pickingCriteria: "fifo" as const, status: "issued", issueDate: new Date("2026-03-05") },
    { risNumber: "RIS-2026-000005", requestingOffice: "Communications Office", purpose: "Network supplies", issuedTo: "Rico Fernandez", issuedBy: "Supply Officer", pickingCriteria: "fifo" as const, status: "pending", issueDate: new Date("2026-03-18") },
    { risNumber: "RIS-2026-000006", requestingOffice: "Administrative Division", purpose: "General office supplies", issuedTo: "Carmen Villanueva", issuedBy: "Supply Officer", pickingCriteria: "fefo" as const, status: "cancelled", issueDate: new Date("2026-03-22"), remarks: "Cancelled due to insufficient stock" },
  ]

  const insertedRIS = []
  for (const r of records) {
    const [inserted] = await db.insert(risRecords).values(r).returning()
    insertedRIS.push(inserted)
  }

  // Add items to first RIS
  if (inventoryItemIds.length >= 2) {
    await db.insert(risItems).values([
      { risId: insertedRIS[0].id, inventoryItemId: inventoryItemIds[0], quantity: 10, remarks: "For Q1 use" },
      { risId: insertedRIS[0].id, inventoryItemId: inventoryItemIds[1], quantity: 5 },
    ])
  }

  console.log(`Inserted ${insertedRIS.length} RIS records`)
}

async function seedPropertyReceipts() {
  console.log("Seeding property receipts...")
  const receipts = [
    {
      receiptNumber: "PAR-2024-000001",
      type: "par" as const,
      custodian: "Pedro Bautista",
      department: "IT Division",
      issueDate: new Date("2024-03-01"),
      items: [{ name: "Desktop Computer (Dell OptiPlex)", qty: 5, unitCost: 45000 }],
      status: "active",
      totalValue: "225000.00",
    },
    {
      receiptNumber: "PAR-2024-000002",
      type: "par" as const,
      custodian: "Maria Santos",
      department: "Office of the Director",
      issueDate: new Date("2024-03-15"),
      items: [{ name: "Air Conditioning Unit (1.5HP)", qty: 2, unitCost: 28000 }],
      status: "active",
      totalValue: "56000.00",
    },
    {
      receiptNumber: "PAR-2024-000003",
      type: "par" as const,
      custodian: "Ana Reyes",
      department: "Finance Division",
      issueDate: new Date("2024-04-01"),
      items: [{ name: "Laser Printer (HP LaserJet)", qty: 2, unitCost: 18500 }],
      status: "active",
      totalValue: "37000.00",
    },
    {
      receiptNumber: "ICS-2025-000001",
      type: "ics" as const,
      custodian: "Liza Mercado",
      department: "Records Section",
      issueDate: new Date("2025-01-10"),
      items: [{ name: "Telephone Set", qty: 3, unitCost: 1500 }],
      status: "active",
      totalValue: "4500.00",
    },
    {
      receiptNumber: "ICS-2025-000002",
      type: "ics" as const,
      custodian: "Juan dela Cruz",
      department: "Office of the Director",
      issueDate: new Date("2025-02-01"),
      items: [{ name: "Desktop Calculator (Casio)", qty: 5, unitCost: 850 }, { name: "Electric Fan (Stand Type)", qty: 2, unitCost: 2200 }],
      status: "active",
      totalValue: "8650.00",
    },
    {
      receiptNumber: "ICS-2025-000003",
      type: "ics" as const,
      custodian: "Rico Fernandez",
      department: "Communications Office",
      issueDate: new Date("2025-06-15"),
      items: [{ name: "Telephone Set", qty: 4, unitCost: 1500 }],
      status: "active",
      totalValue: "6000.00",
    },
  ]

  for (const r of receipts) {
    await db.insert(propertyReceipts).values(r)
  }
  console.log(`Inserted ${receipts.length} property receipts`)
}

async function seedAuditLogs() {
  console.log("Seeding audit logs...")
  const logs = [
    { userEmail: "admin@demo.local", action: "CREATE", entityType: "inventory_item", entityId: "BCS-SM-001", details: { name: "Bond Paper (Short)", quantity: 150 }, ipAddress: "192.168.1.10", createdAt: new Date("2026-01-05T08:00:00") },
    { userEmail: "admin@demo.local", action: "CREATE", entityType: "purchase_request", entityId: "PR-2026-000001", details: { prNumber: "PR-2026-000001", totalAmount: 12500 }, ipAddress: "192.168.1.10", createdAt: new Date("2026-01-10T09:30:00") },
    { userEmail: "manager@demo.local", action: "APPROVE", entityType: "purchase_request", entityId: "PR-2026-000001", details: { status: "approved" }, ipAddress: "192.168.1.15", createdAt: new Date("2026-01-15T10:00:00") },
    { userEmail: "dev@demo.local", action: "CREATE", entityType: "ris_record", entityId: "RIS-2026-000001", details: { risNumber: "RIS-2026-000001" }, ipAddress: "192.168.1.20", createdAt: new Date("2026-01-20T14:00:00") },
    { userEmail: "admin@demo.local", action: "UPDATE", entityType: "inventory_item", entityId: "BCS-PPE-001", details: { field: "quantity", old: 25, new: 20 }, ipAddress: "192.168.1.10", createdAt: new Date("2026-02-01T11:00:00") },
    { userEmail: "tester@demo.local", action: "CREATE", entityType: "purchase_request", entityId: "PR-2026-000004", details: { prNumber: "PR-2026-000004" }, ipAddress: "192.168.1.25", createdAt: new Date("2026-03-01T09:00:00") },
  ]

  for (const log of logs) {
    await db.insert(auditLogs).values(log)
  }
  console.log(`Inserted ${logs.length} audit log entries`)
}

async function main() {
  console.log("=== BCS IMS Seed Start ===")

  await seedAccounts()

  const inventoryInserted = await seedInventory()
  const itemIds = inventoryInserted.map(i => i.id)

  await seedPurchaseRequests(itemIds)
  await seedRIS(itemIds)
  await seedPropertyReceipts()
  await seedAuditLogs()

  console.log("=== BCS IMS Seed Complete ===")
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
