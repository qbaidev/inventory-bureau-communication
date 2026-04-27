import { Module } from "@nestjs/common"

import { ExamplesModule } from "./examples/examples.module"
import { HealthModule } from "./health/health.module"
import { InventoryItemsModule } from "./inventory-items/inventory-items.module"
import { PurchaseRequestsModule } from "./purchase-requests/purchase-requests.module"
import { RisRecordsModule } from "./ris-records/ris-records.module"
import { PropertyReceiptsModule } from "./property-receipts/property-receipts.module"
import { AuditLogsModule } from "./audit-logs/audit-logs.module"
import { ReportsModule } from "./reports/reports.module"

@Module({
  imports: [
    ExamplesModule,
    HealthModule,
    InventoryItemsModule,
    PurchaseRequestsModule,
    RisRecordsModule,
    PropertyReceiptsModule,
    AuditLogsModule,
    ReportsModule,
  ],
})
export class V1Module {}
