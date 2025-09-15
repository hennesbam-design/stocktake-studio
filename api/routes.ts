import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDepartmentSchema,
  insertAreaSchema,
  insertProductGroupSchema,
  insertItemSchema,
  insertStocktakeSessionSchema,
  insertStocktakeEntrySchema
} from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

}
