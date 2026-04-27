import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { InventoryItemsService } from "./inventory-items.service"

@AllowAnonymous()
@Controller({ path: "inventory-items", version: "1" })
export class InventoryItemsController {
  constructor(private readonly service: InventoryItemsService) {}

  @Get()
  findAll(@Query("type") type?: string) {
    return this.service.findAll(type)
  }

  @Get("stats")
  getStats() {
    return this.service.getStats()
  }

  @Get("expiring")
  getExpiring(@Query("days") days?: string) {
    return this.service.getExpiringItems(days ? parseInt(days) : 60)
  }

  @Get("low-stock")
  getLowStock(@Query("threshold") threshold?: string) {
    return this.service.getLowStockItems(threshold ? parseInt(threshold) : 5)
  }

  @Get("barcode/:barcode")
  findByBarcode(@Param("barcode") barcode: string) {
    return this.service.findByBarcode(barcode)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data)
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) {
    return this.service.update(id, data)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id)
  }
}
