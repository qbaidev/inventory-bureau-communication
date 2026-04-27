import { Injectable, NotFoundException } from "@nestjs/common"
import { db } from "@repo/db"
import { inventoryItems, inventoryBatches } from "@repo/db/schema"
import { eq, desc, asc, lte, gte, and, isNotNull, lt } from "drizzle-orm"

// ── Expiry thresholds (days) ──────────────────────────────────────────────────
const CRITICAL_DAYS = 7
const WARNING_DAYS = 30
const CAUTION_DAYS = 60

export type ExpiryCategory = "expired" | "critical" | "warning" | "caution" | "healthy" | "no_expiry"

function getExpiryCategory(expiryDate: Date | null | undefined): ExpiryCategory {
  if (!expiryDate) return "no_expiry"
  const daysLeft = (new Date(expiryDate).getTime() - Date.now()) / 86400000
  if (daysLeft < 0) return "expired"
  if (daysLeft <= CRITICAL_DAYS) return "critical"
  if (daysLeft <= WARNING_DAYS) return "warning"
  if (daysLeft <= CAUTION_DAYS) return "caution"
  return "healthy"
}

@Injectable()
export class InventoryItemsService {

  // ── Inventory Items ─────────────────────────────────────────────────────────

  async findAll(type?: string) {
    const query = db.select().from(inventoryItems).orderBy(desc(inventoryItems.createdAt))
    const result = type
      ? await db.select().from(inventoryItems).where(eq(inventoryItems.type, type as any)).orderBy(desc(inventoryItems.createdAt))
      : await query
    return result
  }

  async findOne(id: string) {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id))
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`)
    return item
  }

  async findByBarcode(barcode: string) {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.barcode, barcode))
    if (!item) throw new NotFoundException(`Item with barcode ${barcode} not found`)
    return item
  }

  async create(data: any) {
    const barcode = data.barcode || `BCS-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const itemCode = data.itemCode || `BCS-${data.type?.toUpperCase()?.slice(0, 2) || "IT"}-${Date.now().toString().slice(-4)}`
    const [item] = await db.insert(inventoryItems).values({
      ...data,
      barcode,
      itemCode,
    }).returning()
    return item
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    const [item] = await db.update(inventoryItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning()
    return item
  }

  async remove(id: string) {
    await this.findOne(id)
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id))
    return { message: "Item deleted successfully" }
  }

  // ── Expiry Monitoring (Item-level) ──────────────────────────────────────────

  /**
   * Returns items expiring within daysAhead days (not yet expired).
   * Uses SQL-level filtering for efficiency.
   */
  async getExpiringItems(daysAhead = 60) {
    const now = new Date()
    const cutoff = new Date(now.getTime() + daysAhead * 86400000)
    return await db.select()
      .from(inventoryItems)
      .where(
        and(
          isNotNull(inventoryItems.expiryDate),
          gte(inventoryItems.expiryDate, now),
          lte(inventoryItems.expiryDate, cutoff),
        )
      )
      .orderBy(asc(inventoryItems.expiryDate))
  }

  /**
   * Returns items that are already past their expiry date.
   */
  async getExpiredItems() {
    const now = new Date()
    return await db.select()
      .from(inventoryItems)
      .where(
        and(
          isNotNull(inventoryItems.expiryDate),
          lt(inventoryItems.expiryDate, now),
        )
      )
      .orderBy(asc(inventoryItems.expiryDate))
  }

  /**
   * Returns a full categorized expiry report for all items that have an expiry date.
   * Categories: expired | critical (≤7d) | warning (≤30d) | caution (≤60d) | healthy
   */
  async getExpiryReport() {
    const itemsWithExpiry = await db.select()
      .from(inventoryItems)
      .where(isNotNull(inventoryItems.expiryDate))
      .orderBy(asc(inventoryItems.expiryDate))

    const categorized = itemsWithExpiry.map(item => ({
      ...item,
      expiryCategory: getExpiryCategory(item.expiryDate),
      daysUntilExpiry: item.expiryDate
        ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }))

    const expired  = categorized.filter(i => i.expiryCategory === "expired")
    const critical = categorized.filter(i => i.expiryCategory === "critical")
    const warning  = categorized.filter(i => i.expiryCategory === "warning")
    const caution  = categorized.filter(i => i.expiryCategory === "caution")
    const healthy  = categorized.filter(i => i.expiryCategory === "healthy")

    return {
      summary: {
        expired:  expired.length,
        critical: critical.length,
        warning:  warning.length,
        caution:  caution.length,
        healthy:  healthy.length,
        total:    categorized.length,
      },
      expired,
      critical,
      warning,
      caution,
      healthy,
    }
  }

  async getLowStockItems(threshold = 5) {
    const all = await db.select().from(inventoryItems)
    return all.filter(item => item.quantity <= threshold)
  }

  async getStats() {
    const all = await db.select().from(inventoryItems)
    const total = all.length
    const supplies = all.filter(i => i.type === "supplies_materials").length
    const semiExpendable = all.filter(i => i.type === "semi_expendable").length
    const ppe = all.filter(i => i.type === "ppe").length
    const expiringIn30 = all.filter(i => {
      if (!i.expiryDate) return false
      const diff = (new Date(i.expiryDate).getTime() - Date.now()) / 86400000
      return diff >= 0 && diff <= 30
    }).length
    const totalValue = all.reduce((sum, i) => sum + parseFloat(String(i.bookValue || 0)), 0)
    return { total, supplies, semiExpendable, ppe, expiringIn30, totalValue }
  }

  // ── Batch Management ────────────────────────────────────────────────────────

  /**
   * Returns all batches, optionally filtered by inventory item ID.
   * Enriches each batch with its parent item's name and code.
   */
  async findAllBatches(inventoryItemId?: string) {
    const rows = await db.select({
      batch: inventoryBatches,
      itemName: inventoryItems.name,
      itemCode: inventoryItems.itemCode,
      itemType: inventoryItems.type,
    })
      .from(inventoryBatches)
      .innerJoin(inventoryItems, eq(inventoryBatches.inventoryItemId, inventoryItems.id))
      .where(inventoryItemId ? eq(inventoryBatches.inventoryItemId, inventoryItemId) : undefined)
      .orderBy(desc(inventoryBatches.createdAt))

    return rows.map(r => ({
      ...r.batch,
      itemName: r.itemName,
      itemCode: r.itemCode,
      itemType: r.itemType,
      expiryCategory: getExpiryCategory(r.batch.expiryDate),
      daysUntilExpiry: r.batch.expiryDate
        ? Math.ceil((new Date(r.batch.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }))
  }

  async findOneBatch(id: string) {
    const [row] = await db.select({
      batch: inventoryBatches,
      itemName: inventoryItems.name,
      itemCode: inventoryItems.itemCode,
    })
      .from(inventoryBatches)
      .innerJoin(inventoryItems, eq(inventoryBatches.inventoryItemId, inventoryItems.id))
      .where(eq(inventoryBatches.id, id))

    if (!row) throw new NotFoundException(`Batch ${id} not found`)
    return {
      ...row.batch,
      itemName: row.itemName,
      itemCode: row.itemCode,
      expiryCategory: getExpiryCategory(row.batch.expiryDate),
      daysUntilExpiry: row.batch.expiryDate
        ? Math.ceil((new Date(row.batch.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }
  }

  async createBatch(inventoryItemId: string, data: any) {
    await this.findOne(inventoryItemId)
    const [batch] = await db.insert(inventoryBatches).values({
      ...data,
      inventoryItemId,
      remainingQuantity: data.remainingQuantity ?? data.quantity,
    }).returning()
    return batch
  }

  async updateBatch(id: string, data: any) {
    await this.findOneBatch(id)
    const [batch] = await db.update(inventoryBatches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventoryBatches.id, id))
      .returning()
    return batch
  }

  async removeBatch(id: string) {
    await this.findOneBatch(id)
    await db.delete(inventoryBatches).where(eq(inventoryBatches.id, id))
    return { message: "Batch deleted successfully" }
  }

  // ── Batch Expiry Monitoring ─────────────────────────────────────────────────

  /**
   * Returns batches expiring within daysAhead days (not yet expired), active only.
   */
  async getExpiringBatches(daysAhead = 60) {
    const now = new Date()
    const cutoff = new Date(now.getTime() + daysAhead * 86400000)
    const rows = await db.select({
      batch: inventoryBatches,
      itemName: inventoryItems.name,
      itemCode: inventoryItems.itemCode,
    })
      .from(inventoryBatches)
      .innerJoin(inventoryItems, eq(inventoryBatches.inventoryItemId, inventoryItems.id))
      .where(
        and(
          isNotNull(inventoryBatches.expiryDate),
          gte(inventoryBatches.expiryDate, now),
          lte(inventoryBatches.expiryDate, cutoff),
          eq(inventoryBatches.status, "active"),
        )
      )
      .orderBy(asc(inventoryBatches.expiryDate))

    return rows.map(r => ({
      ...r.batch,
      itemName: r.itemName,
      itemCode: r.itemCode,
      expiryCategory: getExpiryCategory(r.batch.expiryDate),
      daysUntilExpiry: r.batch.expiryDate
        ? Math.ceil((new Date(r.batch.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }))
  }

  /**
   * Returns batches that are already past their expiry date with active status.
   * These should be flagged for disposal or status update.
   */
  async getExpiredBatches() {
    const now = new Date()
    const rows = await db.select({
      batch: inventoryBatches,
      itemName: inventoryItems.name,
      itemCode: inventoryItems.itemCode,
    })
      .from(inventoryBatches)
      .innerJoin(inventoryItems, eq(inventoryBatches.inventoryItemId, inventoryItems.id))
      .where(
        and(
          isNotNull(inventoryBatches.expiryDate),
          lt(inventoryBatches.expiryDate, now),
          eq(inventoryBatches.status, "active"),
        )
      )
      .orderBy(asc(inventoryBatches.expiryDate))

    return rows.map(r => ({
      ...r.batch,
      itemName: r.itemName,
      itemCode: r.itemCode,
      expiryCategory: "expired" as ExpiryCategory,
      daysUntilExpiry: r.batch.expiryDate
        ? Math.ceil((new Date(r.batch.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }))
  }

  /**
   * Full batch monitoring dashboard report.
   * Returns summary counts + categorized batch lists.
   */
  async getBatchMonitoringReport() {
    const allRows = await db.select({
      batch: inventoryBatches,
      itemName: inventoryItems.name,
      itemCode: inventoryItems.itemCode,
      itemType: inventoryItems.type,
    })
      .from(inventoryBatches)
      .innerJoin(inventoryItems, eq(inventoryBatches.inventoryItemId, inventoryItems.id))
      .orderBy(asc(inventoryBatches.expiryDate))

    const enriched = allRows.map(r => ({
      ...r.batch,
      itemName: r.itemName,
      itemCode: r.itemCode,
      itemType: r.itemType,
      expiryCategory: getExpiryCategory(r.batch.expiryDate),
      daysUntilExpiry: r.batch.expiryDate
        ? Math.ceil((new Date(r.batch.expiryDate).getTime() - Date.now()) / 86400000)
        : null,
    }))

    const withExpiry = enriched.filter(b => b.expiryDate !== null)
    const expired  = withExpiry.filter(b => b.expiryCategory === "expired")
    const critical = withExpiry.filter(b => b.expiryCategory === "critical")
    const warning  = withExpiry.filter(b => b.expiryCategory === "warning")
    const caution  = withExpiry.filter(b => b.expiryCategory === "caution")
    const healthy  = withExpiry.filter(b => b.expiryCategory === "healthy")
    const noExpiry = enriched.filter(b => b.expiryDate === null)

    return {
      summary: {
        total:          enriched.length,
        expired:        expired.length,
        critical:       critical.length,
        warning:        warning.length,
        caution:        caution.length,
        healthy:        healthy.length,
        noExpiry:       noExpiry.length,
        needsAttention: expired.length + critical.length,
      },
      thresholds: {
        critical: CRITICAL_DAYS,
        warning:  WARNING_DAYS,
        caution:  CAUTION_DAYS,
      },
      expired,
      critical,
      warning,
      caution,
      healthy,
    }
  }
}
