export * from "./schema.js"
export * from "./client.js"

// db singleton export (lazy — uses DATABASE_URL from process.env at runtime)
import { createDBClient } from "./client.js"
export const db = createDBClient()
