import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 30, // Increased timeout for Vercel
  max_lifetime: 60 * 30,
  ssl: 'require', // Force SSL for Supabase
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null, // Transform undefined to null
  },
});

// Create the database instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';