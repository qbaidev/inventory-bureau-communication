import { Controller, Get, Param } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { ReportsService } from "./reports.service"

@AllowAnonymous()
@Controller({ path: "reports", version: "1" })
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get(":type")
  getReport(@Param("type") type: string) {
    return this.service.getReportData(type)
  }
}
