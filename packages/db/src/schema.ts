import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";


// ── Auth Tables (Better Auth) ─────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: text("email_verified"),
  image: text("image"),
  role: text("role").notNull().default("end_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})


// ── Enums ─────────────────────────────────────────────────────────────────────
export const itemTypeEnum = pgEnum("item_type", [
  "supplies_materials",
  "semi_expendable",
  "ppe",
]);
export const itemConditionEnum = pgEnum("item_condition", [
  "serviceable",
  "unserviceable",
  "for_disposal",
]);
export const prStatusEnum = pgEnum("pr_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
]);
export const pickingCriteriaEnum = pgEnum("picking_criteria", [
  "fifo",
  "lifo",
  "fefo",
]);
export const receiptTypeEnum = pgEnum("receipt_type", ["par", "ics"]);

// ── Inventory Items ───────────────────────────────────────────────────────────
export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemCode: text("item_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  type: itemTypeEnum("type").notNull(),
  unit: text("unit").notNull().default("piece"),
  quantity: integer("quantity").notNull().default(0),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull().default("0"),
  bookValue: numeric("book_value", { precision: 14, scale: 2 }).notNull().default("0"),
  batchNumber: text("batch_number"),
  expiryDate: timestamp("expiry_date"),
  barcode: text("barcode").unique(),
  location: text("location"),
  condition: itemConditionEnum("condition").notNull().default("serviceable"),
  lifespanYears: integer("lifespan_years"),
  acquisitionDate: timestamp("acquisition_date"),
  depreciationRate: numeric("depreciation_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Purchase Requests ─────────────────────────────────────────────────────────
export const purchaseRequests = pgTable("purchase_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  prNumber: text("pr_number").notNull().unique(),
  requestingOffice: text("requesting_office").notNull(),
  purpose: text("purpose").notNull(),
  status: prStatusEnum("status").notNull().default("draft"),
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  approvalDate: timestamp("approval_date"),
  notes: text("notes"),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const prItems = pgTable("pr_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  prId: uuid("pr_id")
    .references(() => purchaseRequests.id, { onDelete: "cascade" })
    .notNull(),
  itemName: text("item_name").notNull(),
  unit: text("unit").notNull().default("piece"),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 14, scale: 2 }).notNull(),
  totalCost: numeric("total_cost", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
});

// ── RIS Records ───────────────────────────────────────────────────────────────
export const risRecords = pgTable("ris_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  risNumber: text("ris_number").notNull().unique(),
  requestingOffice: text("requesting_office").notNull(),
  purpose: text("purpose").notNull(),
  issuedTo: text("issued_to").notNull(),
  issuedBy: text("issued_by").notNull(),
  pickingCriteria: pickingCriteriaEnum("picking_criteria").notNull().default("fifo"),
  status: text("status").notNull().default("pending"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const risItems = pgTable("ris_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  risId: uuid("ris_id")
    .references(() => risRecords.id, { onDelete: "cascade" })
    .notNull(),
  inventoryItemId: uuid("inventory_item_id")
    .references(() => inventoryItems.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  remarks: text("remarks"),
});

// ── Property Receipts (PAR / ICS) ─────────────────────────────────────────────
export const propertyReceipts = pgTable("property_receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  type: receiptTypeEnum("type").notNull(),
  custodian: text("custodian").notNull(),
  department: text("department").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  items: jsonb("items").notNull().default("[]"),
  status: text("status").notNull().default("active"),
  totalValue: numeric("total_value", { precision: 14, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Named schema export for drizzle client
export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  inventoryItems,
  purchaseRequests,
  prItems,
  risRecords,
  risItems,
  propertyReceipts,
  auditLogs,
}
