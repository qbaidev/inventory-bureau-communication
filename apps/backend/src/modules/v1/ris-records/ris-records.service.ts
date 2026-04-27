import { Injectable, NotFoundException } from "@nestjs/common"
import { db } from "@repo/db"
import { risRecords, risItems, inventoryItems } from "@repo/db/schema"
import { eq, desc, asc } from "drizzle-orm"

@Injectable()
export class RisRecordsService {
  async findAll() {
    const records = await db.select().from(risRecords).orderBy(desc(risRecords.createdAt))
    const withItems = await Promise.all(
      records.map(async (r) => {
        const items = await db.select().from(risItems).where(eq(risItems.risId, r.id))
        return { ...r, items }
      })
    )
    return withItems
  }

  async findOne(id: string) {
    const [record] = await db.select().from(risRecords).where(eq(risRecords.id, id))
    if (!record) throw new NotFoundException(`RIS record ${id} not found`)
    const items = await db.select().from(risItems).where(eq(risItems.risId, id))
    return { ...record, items }
  }

  async create(data: any) {
    const { items, ...risData } = data
    const risNumber = `RIS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const [record] = await db.insert(risRecords).values({ ...risData, risNumber }).returning()
    if (items?.length) {
      await db.insert(risItems).values(items.map((i: any) => ({ ...i, risId: record.id })))
    }
    return this.findOne(record.id)
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    const [record] = await db.update(risRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(risRecords.id, id))
      .returning()
    return record
  }

  async remove(id: string) {
    await this.findOne(id)
    await db.delete(risRecords).where(eq(risRecords.id, id))
    return { message: "RIS record deleted" }
  }

  async getSuggestedItems(inventoryItemId: string, criteria: string) {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, inventoryItemId))
    if (!item) throw new NotFoundException("Inventory item not found")
    let allItems = await db.select().from(inventoryItems)
    allItems = allItems.filter(i => i.name === item.name)
    if (criteria === "fifo") allItems.sort((a, b) => new Date(a.acquisitionDate || 0).getTime() - new Date(b.acquisitionDate || 0).getTime())
    else if (criteria === "lifo") allItems.sort((a, b) => new Date(b.acquisitionDate || 0).getTime() - new Date(a.acquisitionDate || 0).getTime())
    else if (criteria === "fefo") allItems.sort((a, b) => new Date(a.expiryDate || "9999").getTime() - new Date(b.expiryDate || "9999").getTime())
    return allItems
  }

  async getStats() {
    const all = await db.select().from(risRecords)
    return {
      total: all.length,
      pending: all.filter((r: any) => r.status === "pending").length,
      issued: all.filter((r: any) => r.status === "issued").length,
      cancelled: all.filter((r: any) => r.status === "cancelled").length,
    }
  }
}
