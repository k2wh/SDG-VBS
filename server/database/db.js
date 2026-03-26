const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sdgvbs.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Migrations for existing databases
const migrations = [
  'ALTER TABLE valor_stakeholders ADD COLUMN descontinuado INTEGER DEFAULT 0',
  'ALTER TABLE beneficio_stakeholders ADD COLUMN descontinuado INTEGER DEFAULT 0',
];
for (const sql of migrations) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

// Seed admin user if no users exist
const bcrypt = require('bcryptjs');
const userCount = db.prepare('SELECT COUNT(*) as c FROM usuarios').get();
if (userCount.c === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)').run('Administrador', 'admin@sdgvbs.com', hash);
  console.log('Usuario admin criado: admin@sdgvbs.com / admin123');
}

module.exports = db;
