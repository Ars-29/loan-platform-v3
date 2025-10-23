#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Read the schema file
const schemaContent = readFileSync('src/lib/db/schema.ts', 'utf-8');

// Extract all column definitions with more precision
const columnMatches = schemaContent.match(/(\w+):\s+\w+\([^)]+\)/g);
const allColumns = columnMatches?.map(match => {
  const [, columnName] = match.match(/(\w+):\s+\w+\([^)]+\)/) || [];
  return columnName;
}) || [];

console.log('🔍 DETAILED UNUSED COLUMNS ANALYSIS');
console.log('==================================\n');

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

// Track column usage
const columnUsage: { [key: string]: number } = {};

// Initialize counters
allColumns.forEach(column => {
  columnUsage[column] = 0;
});

// Analyze each file
sourceFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    
    // Check column usage
    allColumns.forEach(column => {
      if (content.includes(column)) {
        columnUsage[column]++;
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not read file: ${file}`);
  }
});

// Find unused columns
const unusedColumns = Object.entries(columnUsage)
  .filter(([_, count]) => count === 0)
  .sort((a, b) => a[0].localeCompare(b[0]));

console.log(`📊 FOUND ${unusedColumns.length} UNUSED COLUMNS:\n`);

// Group by table (approximate based on common patterns)
const companiesColumns = unusedColumns.filter(([col, _]) => 
  col.includes('company') || 
  col.includes('Company') ||
  col.includes('approval') ||
  col.includes('Approval') ||
  col.includes('version') ||
  col.includes('Version') ||
  col.includes('lastUpdated') ||
  col.includes('LastUpdated')
);

const usersColumns = unusedColumns.filter(([col, _]) => 
  col.includes('invite') ||
  col.includes('Invite') ||
  col.includes('deactivated') ||
  col.includes('Deactivated') ||
  col.includes('lastLogin') ||
  col.includes('LastLogin')
);

const templatesColumns = unusedColumns.filter(([col, _]) => 
  col.includes('preview') ||
  col.includes('Preview') ||
  col.includes('premium') ||
  col.includes('Premium') ||
  col.includes('selected') ||
  col.includes('Selected') ||
  col.includes('layoutConfig') ||
  col.includes('LayoutConfig')
);

const leadsColumns = unusedColumns.filter(([col, _]) => 
  col.includes('conversion') ||
  col.includes('Conversion') ||
  col.includes('application') ||
  col.includes('Application') ||
  col.includes('approval') ||
  col.includes('Approval') ||
  col.includes('closing') ||
  col.includes('Closing') ||
  col.includes('commission') ||
  col.includes('Commission') ||
  col.includes('response') ||
  col.includes('Response') ||
  col.includes('contact') ||
  col.includes('Contact') ||
  col.includes('quality') ||
  col.includes('Quality') ||
  col.includes('geographic') ||
  col.includes('Geographic')
);

const otherColumns = unusedColumns.filter(([col, _]) => 
  !companiesColumns.some(([c, _]) => c === col) &&
  !usersColumns.some(([c, _]) => c === col) &&
  !templatesColumns.some(([c, _]) => c === col) &&
  !leadsColumns.some(([c, _]) => c === col)
);

console.log('🏢 COMPANIES TABLE - UNUSED COLUMNS:');
companiesColumns.forEach(([column, _]) => {
  console.log(`- ${column}`);
});

console.log('\n👤 USERS TABLE - UNUSED COLUMNS:');
usersColumns.forEach(([column, _]) => {
  console.log(`- ${column}`);
});

console.log('\n🎨 TEMPLATES TABLE - UNUSED COLUMNS:');
templatesColumns.forEach(([column, _]) => {
  console.log(`- ${column}`);
});

console.log('\n📊 LEADS TABLE - UNUSED COLUMNS:');
leadsColumns.forEach(([column, _]) => {
  console.log(`- ${column}`);
});

console.log('\n🔧 OTHER TABLES - UNUSED COLUMNS:');
otherColumns.forEach(([column, _]) => {
  console.log(`- ${column}`);
});

console.log('\n📈 SUMMARY BY TABLE:');
console.log(`- Companies: ${companiesColumns.length} unused columns`);
console.log(`- Users: ${usersColumns.length} unused columns`);
console.log(`- Templates: ${templatesColumns.length} unused columns`);
console.log(`- Leads: ${leadsColumns.length} unused columns`);
console.log(`- Other: ${otherColumns.length} unused columns`);
console.log(`- Total: ${unusedColumns.length} unused columns`);

console.log('\n🎯 RECOMMENDATIONS:');
console.log('===================');
console.log('1. Remove unused columns from schema');
console.log('2. Create migration to drop unused columns');
console.log('3. Test thoroughly after cleanup');
console.log('4. Keep essential columns for future features');

console.log('\n✨ Detailed analysis complete!');
