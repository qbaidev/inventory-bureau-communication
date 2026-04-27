import { Injectable, NotFoundException } from "@nestjs/common"
import { db } from "@repo/db"
import { inventoryItems } from "@repo/db/schema"
import { eq, desc, asc } from "drizzle-orm"

@Injectable()
export class InventoryItemsService {
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

  async getExpiringItems(daysAhead = 60) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + daysAhead)
    const all = await db.select().from(inventoryItems)
    return all.filter(item => item.expiryDate && new Date(item.expiryDate) <= cutoff)
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
}
