import { Module } from "@nestjs/common"
import { RisRecordsController } from "./ris-records.controller"
import { RisRecordsService } from "./ris-records.service"

@Module({
  controllers: [RisRecordsController],
  providers: [RisRecordsService],
  exports: [RisRecordsService],
})
export class RisRecordsModule {}
