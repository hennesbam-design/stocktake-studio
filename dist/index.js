// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { eq } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var sql = neon(process.env.DATABASE_URL);
var db = drizzle(sql);

// shared/schema.ts
import { sql as sql2 } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description")
});
var areas = pgTable("areas", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull(),
  name: text("name").notNull()
});
var productGroups = pgTable("product_groups", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  areaId: varchar("area_id").notNull(),
  name: text("name").notNull()
});
var items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  name: text("name").notNull(),
  barcode: text("barcode"),
  groupId: varchar("group_id").notNull(),
  defaultFulls: integer("default_fulls").default(0),
  defaultSingles: integer("default_singles").default(0),
  packVolume: text("pack_volume")
  // Add pack volume field
});
var stocktakeSessions = pgTable("stocktake_sessions", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  date: text("date").notNull(),
  operatorName: text("operator_name").notNull(),
  departmentId: varchar("department_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var stocktakeEntries = pgTable("stocktake_entries", {
  id: varchar("id").primaryKey().default(sql2`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  itemId: varchar("item_id").notNull(),
  fulls: integer("fulls").notNull().default(0),
  singles: integer("singles").notNull().default(0),
  notes: text("notes"),
  enteredBy: text("entered_by").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
var insertAreaSchema = createInsertSchema(areas).omit({ id: true });
var insertProductGroupSchema = createInsertSchema(productGroups).omit({ id: true });
var insertItemSchema = createInsertSchema(items).omit({ id: true });
var insertStocktakeSessionSchema = createInsertSchema(stocktakeSessions).omit({ id: true, createdAt: true });
var insertStocktakeEntrySchema = createInsertSchema(stocktakeEntries).omit({ id: true, createdAt: true });

// server/storage.ts
var DbStorage = class {
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
    if (itemsList.length === 0) return [];
    const result = await db.insert(items).values(itemsList).returning();
    return result;
  }
  async importFromCSV(csvData) {
    const errors = [];
    const created = { departments: 0, areas: 0, productGroups: 0, items: 0 };
    const departmentMap = /* @__PURE__ */ new Map();
    const areaMap = /* @__PURE__ */ new Map();
    const productGroupMap = /* @__PURE__ */ new Map();
    try {
      const existingDepartments = await this.getDepartments();
      const existingAreas = await this.getAreas();
      const existingGroups = await this.getProductGroups();
      existingDepartments.forEach((dept) => departmentMap.set(dept.name.toLowerCase(), dept.id));
      existingAreas.forEach((area) => areaMap.set(`${area.departmentId}:${area.name.toLowerCase()}`, area.id));
      existingGroups.forEach((group) => productGroupMap.set(`${group.areaId}:${group.name.toLowerCase()}`, group.id));
      const itemsToCreate = [];
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        try {
          const barcode = row["Stock Type"] || row.stockType || row.stock_type || null;
          const department = row["Category"] || row.category;
          const area = row["Sub Category"] || row.subCategory || row.sub_category;
          const productGroup = row["Brand "] || row["Brand"] || row.brand;
          const packVolume = row["Pack Volume"] || row.packVolume || row.pack_volume || null;
          const itemName = productGroup || "Unknown Item";
          const defaultFulls = parseInt(row.default_fulls || row.fulls || "0") || null;
          const defaultSingles = parseInt(row.default_singles || row.singles || "0") || null;
          if (!department || !area || !productGroup) {
            errors.push(`Row ${i + 1}: Missing required fields (Category, Sub Category, Brand). Row data: ${JSON.stringify(row)}`);
            continue;
          }
          const deptKey = department.toLowerCase();
          let departmentId = departmentMap.get(deptKey);
          if (!departmentId) {
            const newDept = await this.createDepartment({ name: department, description: null });
            departmentId = newDept.id;
            departmentMap.set(deptKey, departmentId);
            created.departments++;
          }
          const areaKey = `${departmentId}:${area.toLowerCase()}`;
          let areaId = areaMap.get(areaKey);
          if (!areaId) {
            const newArea = await this.createArea({ name: area, departmentId });
            areaId = newArea.id;
            areaMap.set(areaKey, areaId);
            created.areas++;
          }
          const groupKey = `${areaId}:${productGroup.toLowerCase()}`;
          let productGroupId = productGroupMap.get(groupKey);
          if (!productGroupId) {
            const newGroup = await this.createProductGroup({ name: productGroup, areaId });
            productGroupId = newGroup.id;
            productGroupMap.set(groupKey, productGroupId);
            created.productGroups++;
          }
          itemsToCreate.push({
            name: itemName,
            barcode,
            groupId: productGroupId,
            defaultFulls,
            defaultSingles,
            packVolume
          });
        } catch (rowError) {
          errors.push(`Row ${i + 1}: ${rowError instanceof Error ? rowError.message : "Unknown error"}`);
        }
      }
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
      console.error("CSV import error:", error);
      return {
        success: false,
        created,
        errors: [error instanceof Error ? error.message : "Unknown import error"]
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
    return result.rowCount >= 0;
  }
};
var storage = new DbStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/departments", async (req, res) => {
    try {
      const departments2 = await storage.getDepartments();
      res.json(departments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });
  app2.post("/api/departments", async (req, res) => {
    try {
      const result = insertDepartmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const department = await storage.createDepartment(result.data);
      res.json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });
  app2.get("/api/areas", async (req, res) => {
    try {
      const { departmentId } = req.query;
      const areas2 = await storage.getAreas(departmentId);
      res.json(areas2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch areas" });
    }
  });
  app2.post("/api/areas", async (req, res) => {
    try {
      const result = insertAreaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const area = await storage.createArea(result.data);
      res.json(area);
    } catch (error) {
      res.status(500).json({ error: "Failed to create area" });
    }
  });
  app2.get("/api/product-groups", async (req, res) => {
    try {
      const { areaId } = req.query;
      const groups = await storage.getProductGroups(areaId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product groups" });
    }
  });
  app2.post("/api/product-groups", async (req, res) => {
    try {
      const result = insertProductGroupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const group = await storage.createProductGroup(result.data);
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product group" });
    }
  });
  app2.get("/api/items", async (req, res) => {
    try {
      const { groupId } = req.query;
      const items2 = await storage.getItems(groupId);
      res.json(items2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });
  app2.get("/api/items/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const item = await storage.getItemByBarcode(barcode);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item by barcode" });
    }
  });
  app2.post("/api/items", async (req, res) => {
    try {
      const result = insertItemSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const item = await storage.createItem(result.data);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });
  app2.post("/api/items/bulk", async (req, res) => {
    try {
      const { items: items2 } = req.body;
      if (!Array.isArray(items2)) {
        return res.status(400).json({ error: "Items must be an array" });
      }
      const validatedItems = [];
      for (const item of items2) {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to bulk create items" });
    }
  });
  app2.post("/api/import/csv", async (req, res) => {
    try {
      const { csvData } = req.body;
      if (!Array.isArray(csvData)) {
        return res.status(400).json({ error: "CSV data must be an array" });
      }
      const result = await storage.importFromCSV(csvData);
      res.json(result);
    } catch (error) {
      console.error("CSV import error:", error);
      res.status(500).json({ error: "Failed to import CSV data" });
    }
  });
  app2.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });
  app2.post("/api/sessions", async (req, res) => {
    try {
      const result = insertStocktakeSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const session = await storage.createSession(result.data);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app2.get("/api/entries", async (req, res) => {
    try {
      const { sessionId } = req.query;
      const entries = await storage.getEntries(sessionId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });
  app2.post("/api/entries", async (req, res) => {
    try {
      const result = insertStocktakeEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }
      const entry = await storage.createEntry(result.data);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create entry" });
    }
  });
  app2.delete("/api/entries/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const success = await storage.clearEntries(sessionId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear entries" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
