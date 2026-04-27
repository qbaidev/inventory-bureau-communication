import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { InventoryItemsService } from "./inventory-items.service"

@AllowAnonymous()
@Controller({ path: "inventory-items", version: "1" })
export class InventoryItemsController {
  constructor(private readonly service: InventoryItemsService) {}

  // ── Inventory Items ─────────────────────────────────────────────────────────

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

  @Get("expired")
  getExpired() {
    return this.service.getExpiredItems()
  }

  @Get("expiry-report")
  getExpiryReport() {
    return this.service.getExpiryReport()
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

  // ── Batch Monitoring ────────────────────────────────────────────────────────

  @Get("batches/monitoring-report")
  getBatchMonitoringReport() {
    return this.service.getBatchMonitoringReport()
  }

  @Get("batches/expiring")
  getExpiringBatches(@Query("days") days?: string) {
    return this.service.getExpiringBatches(days ? parseInt(days) : 60)
  }

  @Get("batches/expired")
  getExpiredBatches() {
    return this.service.getExpiredBatches()
  }

  @Get("batches/all")
  findAllBatches(@Query("itemId") itemId?: string) {
    return this.service.findAllBatches(itemId)
  }

  @Get("batches/:batchId")
  findOneBatch(@Param("batchId") batchId: string) {
    return this.service.findOneBatch(batchId)
  }

  @Post(":id/batches")
  createBatch(@Param("id") id: string, @Body() data: any) {
    return this.service.createBatch(id, data)
  }

  @Put("batches/:batchId")
  updateBatch(@Param("batchId") batchId: string, @Body() data: any) {
    return this.service.updateBatch(batchId, data)
  }

  @Delete("batches/:batchId")
  removeBatch(@Param("batchId") batchId: string) {
    return this.service.removeBatch(batchId)
  }
}
