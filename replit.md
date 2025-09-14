# Stocktake Studio

## Overview

Stocktake Studio is a touch-friendly inventory counting web application designed for mobile-first use. The application provides an intuitive interface for conducting stocktakes across different departments, areas, and product groups. It features barcode scanning capabilities, CSV data import/export functionality, and follows Apple Human Interface Guidelines for a clean, productive user experience.

The system allows operators to navigate through a hierarchical structure (Departments → Areas → Product Groups → Items) to perform inventory counts, with support for both "fulls" and "singles" counting units. All data can be exported for external processing or imported from existing inventory systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses **React 18** with **TypeScript** as the primary frontend framework, bundled with **Vite** for development and production builds. The UI is built using **shadcn/ui** components with **Radix UI** primitives, providing accessible and customizable interface elements.

**State Management**: Implemented with **Zustand** for global application state, managing session data, UI state, and inventory entries. This provides a lightweight alternative to Redux while maintaining predictable state updates.

**Routing**: Uses **Wouter** for client-side routing, offering a minimal routing solution suitable for the single-page application structure.

**Data Fetching**: **TanStack Query** (React Query) handles server state management, caching, and data synchronization, though the current implementation primarily uses local state with mock data.

### Styling and Design System
**CSS Framework**: **Tailwind CSS** with a custom design system following Apple's Human Interface Guidelines. The color palette supports both light and dark modes with CSS custom properties for dynamic theming.

**Typography**: Uses **Inter** font from Google Fonts CDN for consistent, readable typography across all screen sizes.

**Touch-First Design**: All interactive elements meet minimum 44px touch targets, with generous spacing and hover states optimized for touch interaction.

### Backend Architecture
**Server Framework**: **Express.js** with TypeScript provides the API layer, though currently minimal with placeholder routes.

**Database Layer**: **Drizzle ORM** configured for **PostgreSQL** with comprehensive schema definitions for departments, areas, product groups, items, stocktake sessions, and entries. The schema supports hierarchical data relationships and audit trails.

**Development Storage**: Currently uses in-memory storage for development with a clean interface pattern that can be easily swapped for database persistence.

### Data Model Structure
The application follows a hierarchical inventory structure:
- **Departments** (top-level categories like Electronics, Grocery)
- **Areas** (sub-categories within departments)
- **Product Groups** (specific product categories)
- **Items** (individual SKUs with barcodes)
- **Stocktake Sessions** (individual counting sessions)
- **Stocktake Entries** (count records for specific items)

### Build and Development Tools
**Build System**: Vite handles both development and production builds, with separate client and server build processes using esbuild for server-side bundling.

**Type Safety**: Comprehensive TypeScript configuration with strict mode enabled, path mapping for clean imports, and shared types between client and server.

**Code Quality**: ESLint and Prettier configuration implied through the shadcn/ui setup for consistent code formatting.

## External Dependencies

### UI and Component Libraries
- **@radix-ui/***: Comprehensive set of headless UI primitives for accessible components
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **lucide-react**: Icon library providing consistent iconography
- **class-variance-authority**: Utility for creating typed variant-based component APIs
- **tailwindcss**: Utility-first CSS framework for styling

### State Management and Data Handling
- **zustand**: Lightweight state management for global application state
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form

### Database and Backend
- **drizzle-orm**: Type-safe SQL ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **drizzle-zod**: Zod integration for runtime type validation
- **connect-pg-simple**: PostgreSQL session store for Express

### Development and Build Tools
- **vite**: Modern build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **typescript**: Type system and compiler
- **esbuild**: Fast JavaScript bundler for server builds

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional CSS class name utility
- **nanoid**: Unique ID generation
- **papaparse**: CSV parsing and generation

### Mobile and Touch Features
- **cmdk**: Command palette component for search interfaces
- Camera API integration for barcode scanning (browser native)
- Touch-optimized event handling for mobile interactions

### Fonts and External Resources
- **Google Fonts**: Inter font family loaded via CDN
- **Heroicons**: Additional icon resources loaded via CDN for development