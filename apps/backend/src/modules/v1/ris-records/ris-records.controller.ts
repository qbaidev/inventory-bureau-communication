import { Controller, Get, Post, Put, Delete, Body, Param, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { RisRecordsService } from "./ris-records.service"

@AllowAnonymous()
@Controller({ path: "ris-records", version: "1" })
export class RisRecordsController {
  constructor(private readonly service: RisRecordsService) {}

  @Get()
  findAll() { return this.service.findAll() }

  @Get("stats")
  getStats() { return this.service.getStats() }

  @Get("suggest")
  suggest(@Query("itemId") itemId: string, @Query("criteria") criteria: string) {
    return this.service.getSuggestedItems(itemId, criteria)
  }

  @Get(":id")
  findOne(@Param("id") id: string) { return this.service.findOne(id) }

  @Post()
  create(@Body() data: any) { return this.service.create(data) }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: any) { return this.service.update(id, data) }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id) }
}
