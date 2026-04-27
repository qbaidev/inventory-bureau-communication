import { Injectable } from "@nestjs/common"
import { db } from "@repo/db"
import { auditLogs } from "@repo/db/schema"
import { eq, desc } from "drizzle-orm"

@Injectable()
export class AuditLogsService {
  async findAll() {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt))
  }

  async create(data: {
    userId?: string
    userEmail?: string
    action: string
    entityType: string
    entityId?: string
    details?: any
    ipAddress?: string
  }) {
    const [log] = await db.insert(auditLogs).values(data).returning()
    return log
  }

  async remove(id: string) {
    await db.delete(auditLogs).where(eq(auditLogs.id, id))
    return { message: "Audit log deleted" }
  }
}
