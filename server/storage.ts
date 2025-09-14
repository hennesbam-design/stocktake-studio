import { 
  type Department, 
  type InsertDepartment,
  type Area,
  type InsertArea,
  type ProductGroup,
  type InsertProductGroup,
  type Item,
  type InsertItem,
  type StocktakeSession,
  type InsertStocktakeSession,
  type StocktakeEntry,
  type InsertStocktakeEntry
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { departments, areas, productGroups, items, stocktakeSessions, stocktakeEntries } from "@shared/schema";

export interface IStorage {
  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(dept: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, dept: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Areas
  getAreas(departmentId?: string): Promise<Area[]>;
  getArea(id: string): Promise<Area | undefined>;
  createArea(area: InsertArea): Promise<Area>;
  updateArea(id: string, area: Partial<InsertArea>): Promise<Area | undefined>;
  deleteArea(id: string): Promise<boolean>;

  // Product Groups
  getProductGroups(areaId?: string): Promise<ProductGroup[]>;
  getProductGroup(id: string): Promise<ProductGroup | undefined>;
  createProductGroup(group: InsertProductGroup): Promise<ProductGroup>;
  updateProductGroup(id: string, group: Partial<InsertProductGroup>): Promise<ProductGroup | undefined>;
  deleteProductGroup(id: string): Promise<boolean>;

  // Items
  getItems(groupId?: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemByBarcode(barcode: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  bulkCreateItems(items: InsertItem[]): Promise<Item[]>;
  
  // CSV Import
  importFromCSV(csvData: any[]): Promise<{ success: boolean; created: { departments: number; areas: number; productGroups: number; items: number }; errors: string[] }>;

  // Sessions
  getSessions(): Promise<StocktakeSession[]>;
  getSession(id: string): Promise<StocktakeSession | undefined>;
  createSession(session: InsertStocktakeSession): Promise<StocktakeSession>;
  
  // Entries
  getEntries(sessionId?: string): Promise<StocktakeEntry[]>;
  getEntry(id: string): Promise<StocktakeEntry | undefined>;
  createEntry(entry: InsertStocktakeEntry): Promise<StocktakeEntry>;
  clearEntries(sessionId: string): Promise<boolean>;
  
  // Admin operations
  clearAllData(): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await db.select().from(departments).where(eq(departments.id, id));
    return result[0];
  }

  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(dept).returning();
    return result[0];
  }

  async updateDepartment(id: string, dept: Partial<InsertDepartment>): Promise<Department | undefined> {
    const result = await db.update(departments).set(dept).where(eq(departments.id, id)).returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return result.rowCount > 0;
  }

  // Areas
  async getAreas(departmentId?: string): Promise<Area[]> {
    if (departmentId) {
      return await db.select().from(areas).where(eq(areas.departmentId, departmentId));
    }
    return await db.select().from(areas);
  }

  async getArea(id: string): Promise<Area | undefined> {
    const result = await db.select().from(areas).where(eq(areas.id, id));
    return result[0];
  }

  async createArea(area: InsertArea): Promise<Area> {
    const result = await db.insert(areas).values(area).returning();
    return result[0];
  }

  async updateArea(id: string, area: Partial<InsertArea>): Promise<Area | undefined> {
    const result = await db.update(areas).set(area).where(eq(areas.id, id)).returning();
    return result[0];
  }

  async deleteArea(id: string): Promise<boolean> {
    const result = await db.delete(areas).where(eq(areas.id, id));
    return result.rowCount > 0;
  }

  // Product Groups
  async getProductGroups(areaId?: string): Promise<ProductGroup[]> {
    if (areaId) {
      return await db.select().from(productGroups).where(eq(productGroups.areaId, areaId));
    }
    return await db.select().from(productGroups);
  }

  async getProductGroup(id: string): Promise<ProductGroup | undefined> {
    const result = await db.select().from(productGroups).where(eq(productGroups.id, id));
    return result[0];
  }

  async createProductGroup(group: InsertProductGroup): Promise<ProductGroup> {
    const result = await db.insert(productGroups).values(group).returning();
    return result[0];
  }

  async updateProductGroup(id: string, group: Partial<InsertProductGroup>): Promise<ProductGroup | undefined> {
    const result = await db.update(productGroups).set(group).where(eq(productGroups.id, id)).returning();
    return result[0];
  }

  async deleteProductGroup(id: string): Promise<boolean> {
    const result = await db.delete(productGroups).where(eq(productGroups.id, id));
    return result.rowCount > 0;
  }

  // Items
  async getItems(groupId?: string): Promise<Item[]> {
    if (groupId) {
      return await db.select().from(items).where(eq(items.groupId, groupId));
    }
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0];
  }

  async getItemByBarcode(barcode: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.barcode, barcode));
    return result[0];
  }

  async createItem(item: InsertItem): Promise<Item> {
    const result = await db.insert(items).values(item).returning();
    return result[0];
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined> {
    const result = await db.update(items).set(item).where(eq(items.id, id)).returning();
    return result[0];
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return result.rowCount > 0;
  }

  async bulkCreateItems(itemsList: InsertItem[]): Promise<Item[]> {
    if (itemsList.length === 0) return [];
    const result = await db.insert(items).values(itemsList).returning();
    return result;
  }

  async importFromCSV(csvData: any[]): Promise<{ success: boolean; created: { departments: number; areas: number; productGroups: number; items: number }; errors: string[] }> {
    const errors: string[] = [];
    const created = { departments: 0, areas: 0, productGroups: 0, items: 0 };
    
    // Maps to track created entities and avoid duplicates
    const departmentMap = new Map<string, string>();
    const areaMap = new Map<string, string>();
    const productGroupMap = new Map<string, string>();
    
    try {
      // First, get existing entities to avoid duplicates
      const existingDepartments = await this.getDepartments();
      const existingAreas = await this.getAreas();
      const existingGroups = await this.getProductGroups();
      
      // Populate maps with existing entities
      existingDepartments.forEach(dept => departmentMap.set(dept.name.toLowerCase(), dept.id));
      existingAreas.forEach(area => areaMap.set(`${area.departmentId}:${area.name.toLowerCase()}`, area.id));
      existingGroups.forEach(group => productGroupMap.set(`${group.areaId}:${group.name.toLowerCase()}`, group.id));
      
      const itemsToCreate: InsertItem[] = [];
      
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
          
        } catch (rowError) {
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
      
    } catch (error) {
      console.error('CSV import error:', error);
      return {
        success: false,
        created,
        errors: [error instanceof Error ? error.message : 'Unknown import error']
      };
    }
  }

  // Sessions
  async getSessions(): Promise<StocktakeSession[]> {
    return await db.select().from(stocktakeSessions);
  }

  async getSession(id: string): Promise<StocktakeSession | undefined> {
    const result = await db.select().from(stocktakeSessions).where(eq(stocktakeSessions.id, id));
    return result[0];
  }

  async createSession(session: InsertStocktakeSession): Promise<StocktakeSession> {
    const result = await db.insert(stocktakeSessions).values(session).returning();
    return result[0];
  }

  // Entries
  async getEntries(sessionId?: string): Promise<StocktakeEntry[]> {
    if (sessionId) {
      return await db.select().from(stocktakeEntries).where(eq(stocktakeEntries.sessionId, sessionId));
    }
    return await db.select().from(stocktakeEntries);
  }

  async getEntry(id: string): Promise<StocktakeEntry | undefined> {
    const result = await db.select().from(stocktakeEntries).where(eq(stocktakeEntries.id, id));
    return result[0];
  }

  async createEntry(entry: InsertStocktakeEntry): Promise<StocktakeEntry> {
    const result = await db.insert(stocktakeEntries).values(entry).returning();
    return result[0];
  }

  async clearEntries(sessionId: string): Promise<boolean> {
    const result = await db.delete(stocktakeEntries).where(eq(stocktakeEntries.sessionId, sessionId));
    return result.rowCount >= 0; // Returns true even if 0 rows deleted (valid for empty sessions)
  }
  
  async clearAllData(): Promise<boolean> {
    try {
      // Delete in proper order to respect foreign key constraints
      await db.delete(stocktakeEntries);
      await db.delete(stocktakeSessions);
      await db.delete(items);
      await db.delete(productGroups);
      await db.delete(areas);
      await db.delete(departments);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export const storage = new DbStorage();
