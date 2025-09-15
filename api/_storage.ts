import { eq } from "drizzle-orm";
import { db } from "./_db.js";
import { departments, areas, productGroups, items, stocktakeSessions, stocktakeEntries } from "../shared/schema.js";

export async function getDepartments() {
  return await db.select().from(departments);
}

export async function getAreas(departmentId?: string) {
  if (departmentId) {
    return await db.select().from(areas).where(eq(areas.departmentId, departmentId));
  }
  return await db.select().from(areas);
}

export async function getItems(groupId?: string) {
  if (groupId) {
    return await db.select().from(items).where(eq(items.groupId, groupId));
  }
  return await db.select().from(items);
}

// Add more CRUD functions as needed for other entities
