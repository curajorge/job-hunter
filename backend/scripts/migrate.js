const fs = require('fs');
const path = require('path');
const db = require('../database');

console.log('🔄 Running Migrations...');

try {
  // Read the schema file
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute the SQL
  db.exec(schemaSql);

  console.log('✅ Migrations completed successfully.');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}