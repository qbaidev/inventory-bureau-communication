import { Module } from "@nestjs/common"
import { PropertyReceiptsController } from "./property-receipts.controller"
import { PropertyReceiptsService } from "./property-receipts.service"

@Module({
  controllers: [PropertyReceiptsController],
  providers: [PropertyReceiptsService],
  exports: [PropertyReceiptsService],
})
export class PropertyReceiptsModule {}
