import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { PurchaseRequestsService } from "./purchase-requests.service"

@AllowAnonymous()
@Controller({ path: "purchase-requests", version: "1" })
export class PurchaseRequestsController {
  constructor(private readonly service: PurchaseRequestsService) {}

  @Get()
  findAll() { return this.service.findAll() }

  @Get("stats")
  getStats() { return this.service.getStats() }

  @Get(":id")
  findOne(@Param("id") id: string) { return this.service.findOne(id) }

  @Post()
  create(@Body() data: any) { return this.service.create(data) }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) { return this.service.update(id, data) }

  @Put(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: { status: string; approvedBy?: string }) {
    return this.service.updateStatus(id, body.status, body.approvedBy)
  }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id) }
}
