import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { PropertyReceiptsService } from "./property-receipts.service"

@AllowAnonymous()
@Controller({ path: "property-receipts", version: "1" })
export class PropertyReceiptsController {
  constructor(private readonly service: PropertyReceiptsService) {}

  @Get()
  findAll(@Query("type") type?: string) { return this.service.findAll(type) }

  @Get("stats")
  getStats() { return this.service.getStats() }

  @Get(":id")
  findOne(@Param("id") id: string) { return this.service.findOne(id) }

  @Post()
  create(@Body() data: any) { return this.service.create(data) }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) { return this.service.update(id, data) }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id) }
}
