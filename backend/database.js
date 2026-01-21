const { DatabaseSync } = require('node:sqlite');
const path = require('path');
require('dotenv').config();

// Initialize Native SQLite database (Node v22.5+)
const dbPath = path.resolve(__dirname, 'jobhunter.db');
const db = new DatabaseSync(dbPath);

// Enable Foreign Keys enforcement
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;