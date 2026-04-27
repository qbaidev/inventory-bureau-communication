import { Injectable, NotFoundException } from "@nestjs/common"
import { db } from "@repo/db"
import { propertyReceipts } from "@repo/db/schema"
import { eq, desc } from "drizzle-orm"

@Injectable()
export class PropertyReceiptsService {
  async findAll(type?: string) {
    const all = await db.select().from(propertyReceipts).orderBy(desc(propertyReceipts.createdAt))
    return type ? all.filter(r => r.type === type) : all
  }

  async findOne(id: string) {
    const [record] = await db.select().from(propertyReceipts).where(eq(propertyReceipts.id, id))
    if (!record) throw new NotFoundException(`Property receipt ${id} not found`)
    return record
  }

  async create(data: any) {
    const year = new Date().getFullYear()
    const prefix = data.type === "par" ? "PAR" : "ICS"
    const receiptNumber = `${prefix}-${year}-${String(Date.now()).slice(-5)}`
    const totalValue = (data.items || []).reduce((sum: number, i: any) => sum + parseFloat(i.unitCost || 0) * parseInt(i.quantity || 1), 0)
    const [record] = await db.insert(propertyReceipts).values({
      ...data,
      receiptNumber,
      totalValue: String(totalValue),
      items: data.items || [],
    }).returning()
    return record
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    const [record] = await db.update(propertyReceipts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(propertyReceipts.id, id))
      .returning()
    return record
  }

  async remove(id: string) {
    await this.findOne(id)
    await db.delete(propertyReceipts).where(eq(propertyReceipts.id, id))
    return { message: "Property receipt deleted" }
  }

  async getStats() {
    const all = await db.select().from(propertyReceipts)
    return {
      total: all.length,
      par: all.filter(r => r.type === "par").length,
      ics: all.filter(r => r.type === "ics").length,
      active: all.filter(r => r.status === "active").length,
    }
  }
}
