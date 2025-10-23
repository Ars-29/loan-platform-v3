#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Read the schema file
const schemaContent = readFileSync('src/lib/db/schema.ts', 'utf-8');

// Extract table definitions
const tableMatches = schemaContent.match(/export const (\w+) = pgTable\('(\w+)'/g);
const tables = tableMatches?.map(match => {
  const [, tableName, tableDbName] = match.match(/export const (\w+) = pgTable\('(\w+)'/) || [];
  return { tableName, tableDbName };
}) || [];

console.log('📊 SCHEMA USAGE ANALYSIS');
console.log('=======================\n');

console.log('🗂️  TABLES DEFINED IN SCHEMA:');
tables.forEach(table => {
  console.log(`- ${table.tableName} (${table.tableDbName})`);
});

// Extract column definitions for each table
const columnMatches = schemaContent.match(/(\w+):\s+\w+\([^)]+\)/g);
const columns = columnMatches?.map(match => {
  const [, columnName] = match.match(/(\w+):\s+\w+\([^)]+\)/) || [];
  return columnName;
}) || [];

console.log('\n📋 COLUMNS DEFINED IN SCHEMA:');
console.log(`Total columns: ${columns.length}`);
console.log('Sample columns:', columns.slice(0, 10).join(', '), '...');

// Function to recursively find all TypeScript/JavaScript files
function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Find all source files
const sourceFiles = findTsFiles('src');
console.log(`\n🔍 ANALYZING ${sourceFiles.length} SOURCE FILES...`);

// Track usage
const tableUsage: { [key: string]: number } = {};
const columnUsage: { [key: string]: number } = {};

// Initialize counters
tables.forEach(table => {
  tableUsage[table.tableName] = 0;
});

columns.forEach(column => {
  columnUsage[column] = 0;
});

// Analyze each file
sourceFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    
    // Check table usage
    tables.forEach(table => {
      if (content.includes(table.tableName)) {
        tableUsage[table.tableName]++;
      }
    });
    
    // Check column usage
    columns.forEach(column => {
      if (content.includes(column)) {
        columnUsage[column]++;
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not read file: ${file}`);
  }
});

console.log('\n📊 TABLE USAGE ANALYSIS:');
console.log('========================');

const usedTables = Object.entries(tableUsage)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1]);

const unusedTables = Object.entries(tableUsage)
  .filter(([_, count]) => count === 0)
  .sort((a, b) => a[0].localeCompare(b[0]));

console.log('\n✅ USED TABLES:');
usedTables.forEach(([table, count]) => {
  console.log(`- ${table}: ${count} references`);
});

console.log('\n❌ UNUSED TABLES:');
unusedTables.forEach(([table, _]) => {
  console.log(`- ${table}: 0 references`);
});

console.log('\n📊 COLUMN USAGE ANALYSIS:');
console.log('==========================');

const usedColumns = Object.entries(columnUsage)
  .filter(([_, count]) => count > 0)
  .sort((a, b) => b[1] - a[1]);

const unusedColumns = Object.entries(columnUsage)
  .filter(([_, count]) => count === 0)
  .sort((a, b) => a[0].localeCompare(b[0]));

console.log('\n✅ MOST USED COLUMNS:');
usedColumns.slice(0, 20).forEach(([column, count]) => {
  console.log(`- ${column}: ${count} references`);
});

console.log('\n❌ UNUSED COLUMNS:');
console.log(`Total unused columns: ${unusedColumns.length}`);
unusedColumns.slice(0, 30).forEach(([column, _]) => {
  console.log(`- ${column}: 0 references`);
});

if (unusedColumns.length > 30) {
  console.log(`... and ${unusedColumns.length - 30} more unused columns`);
}

console.log('\n🎯 RECOMMENDATIONS:');
console.log('===================');

if (unusedTables.length > 0) {
  console.log('\n🗑️  TABLES TO REMOVE:');
  unusedTables.forEach(([table, _]) => {
    console.log(`- ${table} (completely unused)`);
  });
}

if (unusedColumns.length > 0) {
  console.log('\n🗑️  COLUMNS TO REMOVE:');
  console.log(`Total: ${unusedColumns.length} unused columns`);
  console.log('Top unused columns:');
  unusedColumns.slice(0, 20).forEach(([column, _]) => {
    console.log(`- ${column}`);
  });
}

console.log('\n📈 SUMMARY:');
console.log(`- Total tables: ${tables.length}`);
console.log(`- Used tables: ${usedTables.length}`);
console.log(`- Unused tables: ${unusedTables.length}`);
console.log(`- Total columns: ${columns.length}`);
console.log(`- Used columns: ${usedColumns.length}`);
console.log(`- Unused columns: ${unusedColumns.length}`);

console.log('\n✨ Analysis complete!');
