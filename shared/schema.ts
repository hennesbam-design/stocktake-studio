import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stocktake Tables
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

export const areas = pgTable("areas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull(),
  name: text("name").notNull(),
});

export const productGroups = pgTable("product_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  areaId: varchar("area_id").notNull(),
  name: text("name").notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  barcode: text("barcode"),
  groupId: varchar("group_id").notNull(),
  defaultFulls: integer("default_fulls").default(0),
  defaultSingles: integer("default_singles").default(0),
  packVolume: text("pack_volume"), // Add pack volume field
});

export const stocktakeSessions = pgTable("stocktake_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  operatorName: text("operator_name").notNull(),
  departmentId: varchar("department_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stocktakeEntries = pgTable("stocktake_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  itemId: varchar("item_id").notNull(),
  fulls: integer("fulls").notNull().default(0),
  singles: integer("singles").notNull().default(0),
  notes: text("notes"),
  enteredBy: text("entered_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertAreaSchema = createInsertSchema(areas).omit({ id: true });
export const insertProductGroupSchema = createInsertSchema(productGroups).omit({ id: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertStocktakeSessionSchema = createInsertSchema(stocktakeSessions).omit({ id: true, createdAt: true });
export const insertStocktakeEntrySchema = createInsertSchema(stocktakeEntries).omit({ id: true, createdAt: true });

// Types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Area = typeof areas.$inferSelect;
export type InsertArea = z.infer<typeof insertAreaSchema>;

export type ProductGroup = typeof productGroups.$inferSelect;
export type InsertProductGroup = z.infer<typeof insertProductGroupSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type StocktakeSession = typeof stocktakeSessions.$inferSelect;
export type InsertStocktakeSession = z.infer<typeof insertStocktakeSessionSchema>;

export type StocktakeEntry = typeof stocktakeEntries.$inferSelect;
export type InsertStocktakeEntry = z.infer<typeof insertStocktakeEntrySchema>;
