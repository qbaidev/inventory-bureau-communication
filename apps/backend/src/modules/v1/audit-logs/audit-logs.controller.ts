import { Controller, Get, Post, Delete, Body, Param } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { AuditLogsService } from "./audit-logs.service"

@AllowAnonymous()
@Controller({ path: "audit-logs", version: "1" })
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  findAll() { return this.service.findAll() }

  @Post()
  create(@Body() data: any) { return this.service.create(data) }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id) }
}
