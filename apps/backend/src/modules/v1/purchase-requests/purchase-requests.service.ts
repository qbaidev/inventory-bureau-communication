import { Injectable, NotFoundException } from "@nestjs/common"
import { db } from "@repo/db"
import { purchaseRequests, prItems } from "@repo/db/schema"
import { eq, desc } from "drizzle-orm"

@Injectable()
export class PurchaseRequestsService {
  async findAll() {
    const prs = await db.select().from(purchaseRequests).orderBy(desc(purchaseRequests.createdAt))
    const withItems = await Promise.all(
      prs.map(async (pr) => {
        const items = await db.select().from(prItems).where(eq(prItems.prId, pr.id))
        return { ...pr, items }
      })
    )
    return withItems
  }

  async findOne(id: string) {
    const [pr] = await db.select().from(purchaseRequests).where(eq(purchaseRequests.id, id))
    if (!pr) throw new NotFoundException(`Purchase request ${id} not found`)
    const items = await db.select().from(prItems).where(eq(prItems.prId, id))
    return { ...pr, items }
  }

  async create(data: any) {
    const { items, ...prData } = data
    const prNumber = `PR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const totalAmount = (items || []).reduce((sum: number, i: any) => sum + parseFloat(i.totalCost || 0), 0)
    const [pr] = await db.insert(purchaseRequests).values({
      ...prData,
      prNumber,
      totalAmount: String(totalAmount),
      status: "draft",
    }).returning()
    if (items?.length) {
      await db.insert(prItems).values(items.map((i: any) => ({ ...i, prId: pr.id })))
    }
    return this.findOne(pr.id)
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    const { items, ...prData } = data
    const [pr] = await db.update(purchaseRequests)
      .set({ ...prData, updatedAt: new Date() })
      .where(eq(purchaseRequests.id, id))
      .returning()
    return pr
  }

  async updateStatus(id: string, status: string, approvedBy?: string) {
    await this.findOne(id)
    const update: any = { status, updatedAt: new Date() }
    if (status === "approved" || status === "rejected") {
      update.approvedBy = approvedBy || "System"
      update.approvalDate = new Date()
    }
    const [pr] = await db.update(purchaseRequests).set(update).where(eq(purchaseRequests.id, id)).returning()
    return pr
  }

  async remove(id: string) {
    await this.findOne(id)
    await db.delete(purchaseRequests).where(eq(purchaseRequests.id, id))
    return { message: "Purchase request deleted" }
  }

  async getStats() {
    const all = await db.select().from(purchaseRequests)
    return {
      total: all.length,
      draft: all.filter(p => p.status === "draft").length,
      submitted: all.filter(p => p.status === "submitted").length,
      approved: all.filter(p => p.status === "approved").length,
      rejected: all.filter(p => p.status === "rejected").length,
    }
  }
}
