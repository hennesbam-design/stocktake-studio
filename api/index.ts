import express from 'express';
import { registerRoutes } from './routes';

// Create an Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all API routes
registerRoutes(app);

// Export app for Vercel
export default app;
