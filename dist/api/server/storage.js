import { eq } from "drizzle-orm";
import { db } from "./db";
import { departments, areas, productGroups, items, stocktakeSessions, stocktakeEntries } from "@shared/schema";
export class DbStorage {
    // Departments
    async getDepartments() {
        return await db.select().from(departments);
    }
    async getDepartment(id) {
        const result = await db.select().from(departments).where(eq(departments.id, id));
        return result[0];
    }
    async createDepartment(dept) {
        const result = await db.insert(departments).values(dept).returning();
        return result[0];
    }
    async updateDepartment(id, dept) {
        const result = await db.update(departments).set(dept).where(eq(departments.id, id)).returning();
        return result[0];
    }
    async deleteDepartment(id) {
        const result = await db.delete(departments).where(eq(departments.id, id));
        return result.rowCount > 0;
    }
    // Areas
    async getAreas(departmentId) {
        if (departmentId) {
            return await db.select().from(areas).where(eq(areas.departmentId, departmentId));
        }
        return await db.select().from(areas);
    }
    async getArea(id) {
        const result = await db.select().from(areas).where(eq(areas.id, id));
        return result[0];
    }
    async createArea(area) {
        const result = await db.insert(areas).values(area).returning();
        return result[0];
    }
    async updateArea(id, area) {
        const result = await db.update(areas).set(area).where(eq(areas.id, id)).returning();
        return result[0];
    }
    async deleteArea(id) {
        const result = await db.delete(areas).where(eq(areas.id, id));
        return result.rowCount > 0;
    }
    // Product Groups
    async getProductGroups(areaId) {
        if (areaId) {
            return await db.select().from(productGroups).where(eq(productGroups.areaId, areaId));
        }
        return await db.select().from(productGroups);
    }
    async getProductGroup(id) {
        const result = await db.select().from(productGroups).where(eq(productGroups.id, id));
        return result[0];
    }
    async createProductGroup(group) {
        const result = await db.insert(productGroups).values(group).returning();
        return result[0];
    }
    async updateProductGroup(id, group) {
        const result = await db.update(productGroups).set(group).where(eq(productGroups.id, id)).returning();
        return result[0];
    }
    async deleteProductGroup(id) {
        const result = await db.delete(productGroups).where(eq(productGroups.id, id));
        return result.rowCount > 0;
    }
    // Items
    async getItems(groupId) {
        if (groupId) {
            return await db.select().from(items).where(eq(items.groupId, groupId));
        }
        return await db.select().from(items);
    }
    async getItem(id) {
        const result = await db.select().from(items).where(eq(items.id, id));
        return result[0];
    }
    async getItemByBarcode(barcode) {
        const result = await db.select().from(items).where(eq(items.barcode, barcode));
        return result[0];
    }
    async createItem(item) {
        const result = await db.insert(items).values(item).returning();
        return result[0];
    }
    async updateItem(id, item) {
        const result = await db.update(items).set(item).where(eq(items.id, id)).returning();
        return result[0];
    }
    async deleteItem(id) {
        const result = await db.delete(items).where(eq(items.id, id));
        return result.rowCount > 0;
    }
    async bulkCreateItems(itemsList) {
        if (itemsList.length === 0)
            return [];
        const result = await db.insert(items).values(itemsList).returning();
        return result;
    }
    async importFromCSV(csvData) {
        const errors = [];
        const created = { departments: 0, areas: 0, productGroups: 0, items: 0 };
        // Maps to track created entities and avoid duplicates
        const departmentMap = new Map();
        const areaMap = new Map();
        const productGroupMap = new Map();
        try {
            // First, get existing entities to avoid duplicates
            const existingDepartments = await this.getDepartments();
            const existingAreas = await this.getAreas();
            const existingGroups = await this.getProductGroups();
            // Populate maps with existing entities
            existingDepartments.forEach(dept => departmentMap.set(dept.name.toLowerCase(), dept.id));
            existingAreas.forEach(area => areaMap.set(`${area.departmentId}:${area.name.toLowerCase()}`, area.id));
            existingGroups.forEach(group => productGroupMap.set(`${group.areaId}:${group.name.toLowerCase()}`, group.id));
            const itemsToCreate = [];
            for (let i = 0; i < csvData.length; i++) {
                const row = csvData[i];
                try {
                    // Extract and validate required fields - mapping to actual CSV structure
                    // CSV structure: Stock Type, Category, Sub Category, Pack Volume, Brand 
                    const barcode = row['Stock Type'] || row.stockType || row.stock_type || null;
                    const department = row['Category'] || row.category;
                    const area = row['Sub Category'] || row.subCategory || row.sub_category;
                    const productGroup = row['Brand '] || row['Brand'] || row.brand; // Note the space in CSV
                    const packVolume = row['Pack Volume'] || row.packVolume || row.pack_volume || null;
                    const itemName = productGroup || 'Unknown Item'; // Use brand as item name
                    const defaultFulls = parseInt(row.default_fulls || row.fulls || '0') || null;
                    const defaultSingles = parseInt(row.default_singles || row.singles || '0') || null;
                    if (!department || !area || !productGroup) {
                        errors.push(`Row ${i + 1}: Missing required fields (Category, Sub Category, Brand). Row data: ${JSON.stringify(row)}`);
                        continue;
                    }
                    // Create or get department
                    const deptKey = department.toLowerCase();
                    let departmentId = departmentMap.get(deptKey);
                    if (!departmentId) {
                        const newDept = await this.createDepartment({ name: department, description: null });
                        departmentId = newDept.id;
                        departmentMap.set(deptKey, departmentId);
                        created.departments++;
                    }
                    // Create or get area
                    const areaKey = `${departmentId}:${area.toLowerCase()}`;
                    let areaId = areaMap.get(areaKey);
                    if (!areaId) {
                        const newArea = await this.createArea({ name: area, departmentId });
                        areaId = newArea.id;
                        areaMap.set(areaKey, areaId);
                        created.areas++;
                    }
                    // Create or get product group
                    const groupKey = `${areaId}:${productGroup.toLowerCase()}`;
                    let productGroupId = productGroupMap.get(groupKey);
                    if (!productGroupId) {
                        const newGroup = await this.createProductGroup({ name: productGroup, areaId });
                        productGroupId = newGroup.id;
                        productGroupMap.set(groupKey, productGroupId);
                        created.productGroups++;
                    }
                    // Add item to batch create list
                    itemsToCreate.push({
                        name: itemName,
                        barcode,
                        groupId: productGroupId,
                        defaultFulls,
                        defaultSingles,
                        packVolume
                    });
                }
                catch (rowError) {
                    errors.push(`Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
                }
            }
            // Bulk create all items
            if (itemsToCreate.length > 0) {
                const createdItems = await this.bulkCreateItems(itemsToCreate);
                created.items = createdItems.length;
            }
            return {
                success: errors.length === 0,
                created,
                errors
            };
        }
        catch (error) {
            console.error('CSV import error:', error);
            return {
                success: false,
                created,
                errors: [error instanceof Error ? error.message : 'Unknown import error']
            };
        }
    }
    // Sessions
    async getSessions() {
        return await db.select().from(stocktakeSessions);
    }
    async getSession(id) {
        const result = await db.select().from(stocktakeSessions).where(eq(stocktakeSessions.id, id));
        return result[0];
    }
    async createSession(session) {
        const result = await db.insert(stocktakeSessions).values(session).returning();
        return result[0];
    }
    // Entries
    async getEntries(sessionId) {
        if (sessionId) {
            return await db.select().from(stocktakeEntries).where(eq(stocktakeEntries.sessionId, sessionId));
        }
        return await db.select().from(stocktakeEntries);
    }
    async getEntry(id) {
        const result = await db.select().from(stocktakeEntries).where(eq(stocktakeEntries.id, id));
        return result[0];
    }
    async createEntry(entry) {
        const result = await db.insert(stocktakeEntries).values(entry).returning();
        return result[0];
    }
    async clearEntries(sessionId) {
        const result = await db.delete(stocktakeEntries).where(eq(stocktakeEntries.sessionId, sessionId));
        return result.rowCount >= 0; // Returns true even if 0 rows deleted (valid for empty sessions)
    }
    async clearAllData() {
        try {
            // Delete in proper order to respect foreign key constraints
            await db.delete(stocktakeEntries);
            await db.delete(stocktakeSessions);
            await db.delete(items);
            await db.delete(productGroups);
            await db.delete(areas);
            await db.delete(departments);
            return true;
        }
        catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }
}
export const storage = new DbStorage();
