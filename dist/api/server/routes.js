import { createServer } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertAreaSchema, insertProductGroupSchema, insertItemSchema, insertStocktakeSessionSchema, insertStocktakeEntrySchema } from "@shared/schema";
export async function registerRoutes(app) {
    // Departments
    app.get("/api/departments", async (req, res) => {
        try {
            const departments = await storage.getDepartments();
            res.json(departments);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch departments" });
        }
    });
    app.post("/api/departments", async (req, res) => {
        try {
            const result = insertDepartmentSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const department = await storage.createDepartment(result.data);
            res.json(department);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create department" });
        }
    });
    // Areas
    app.get("/api/areas", async (req, res) => {
        try {
            const { departmentId } = req.query;
            const areas = await storage.getAreas(departmentId);
            res.json(areas);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch areas" });
        }
    });
    app.post("/api/areas", async (req, res) => {
        try {
            const result = insertAreaSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const area = await storage.createArea(result.data);
            res.json(area);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create area" });
        }
    });
    // Product Groups
    app.get("/api/product-groups", async (req, res) => {
        try {
            const { areaId } = req.query;
            const groups = await storage.getProductGroups(areaId);
            res.json(groups);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch product groups" });
        }
    });
    app.post("/api/product-groups", async (req, res) => {
        try {
            const result = insertProductGroupSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const group = await storage.createProductGroup(result.data);
            res.json(group);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create product group" });
        }
    });
    // Items
    app.get("/api/items", async (req, res) => {
        try {
            const { groupId } = req.query;
            const items = await storage.getItems(groupId);
            res.json(items);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch items" });
        }
    });
    app.get("/api/items/barcode/:barcode", async (req, res) => {
        try {
            const { barcode } = req.params;
            const item = await storage.getItemByBarcode(barcode);
            if (!item) {
                return res.status(404).json({ error: "Item not found" });
            }
            res.json(item);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch item by barcode" });
        }
    });
    app.post("/api/items", async (req, res) => {
        try {
            const result = insertItemSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const item = await storage.createItem(result.data);
            res.json(item);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create item" });
        }
    });
    app.post("/api/items/bulk", async (req, res) => {
        try {
            const { items } = req.body;
            if (!Array.isArray(items)) {
                return res.status(400).json({ error: "Items must be an array" });
            }
            const validatedItems = [];
            for (const item of items) {
                const result = insertItemSchema.safeParse(item);
                if (!result.success) {
                    return res.status(400).json({
                        error: "Invalid item data",
                        details: result.error.issues,
                        item
                    });
                }
                validatedItems.push(result.data);
            }
            const createdItems = await storage.bulkCreateItems(validatedItems);
            res.json({ success: true, created: createdItems.length, items: createdItems });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to bulk create items" });
        }
    });
    // Comprehensive CSV import endpoint with hierarchical entity creation
    app.post("/api/import/csv", async (req, res) => {
        try {
            const { csvData } = req.body;
            if (!Array.isArray(csvData)) {
                return res.status(400).json({ error: "CSV data must be an array" });
            }
            const result = await storage.importFromCSV(csvData);
            res.json(result);
        }
        catch (error) {
            console.error('CSV import error:', error);
            res.status(500).json({ error: "Failed to import CSV data" });
        }
    });
    // Sessions
    app.get("/api/sessions", async (req, res) => {
        try {
            const sessions = await storage.getSessions();
            res.json(sessions);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch sessions" });
        }
    });
    app.post("/api/sessions", async (req, res) => {
        try {
            const result = insertStocktakeSessionSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const session = await storage.createSession(result.data);
            res.json(session);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create session" });
        }
    });
    // Entries
    app.get("/api/entries", async (req, res) => {
        try {
            const { sessionId } = req.query;
            const entries = await storage.getEntries(sessionId);
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to fetch entries" });
        }
    });
    app.post("/api/entries", async (req, res) => {
        try {
            const result = insertStocktakeEntrySchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.issues });
            }
            const entry = await storage.createEntry(result.data);
            res.json(entry);
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create entry" });
        }
    });
    app.delete("/api/entries/session/:sessionId", async (req, res) => {
        try {
            const { sessionId } = req.params;
            const success = await storage.clearEntries(sessionId);
            res.json({ success });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to clear entries" });
        }
    });
    // Clear all data endpoint (requires admin authorization)
    app.post("/api/admin/clear-all", async (req, res) => {
        try {
            const { adminPin } = req.body;
            // Get server-side admin PIN from environment (fallback to SESSION_SECRET)
            const serverAdminPin = process.env.ADMIN_PIN || process.env.SESSION_SECRET;
            if (!adminPin) {
                return res.status(401).json({ error: "Admin PIN required" });
            }
            // Validate PIN against server secret
            if (adminPin !== serverAdminPin) {
                return res.status(401).json({ error: "Invalid admin PIN" });
            }
            const success = await storage.clearAllData();
            res.json({ success });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to clear all data" });
        }
    });
    const httpServer = createServer(app);
    return httpServer;
}
