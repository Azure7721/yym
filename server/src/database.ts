import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'data', 'portfolio.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS personal_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    category TEXT,
    year TEXT,
    cover_image TEXT,
    envelope_image TEXT,
    pdf_file TEXT,
    tags TEXT,
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Migration: add envelope_image column if it doesn't exist
try {
  db.prepare('SELECT envelope_image FROM projects LIMIT 1').get()
} catch {
  db.exec('ALTER TABLE projects ADD COLUMN envelope_image TEXT')
}

// Seed default admin account if not exists
const existingAdmin = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin')
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin', 10)
  db.prepare('INSERT INTO admin (username, password) VALUES (?, ?)').run('admin', hashedPassword)
}

// Seed default personal info sections if empty
const infoCount = db.prepare('SELECT COUNT(*) as count FROM personal_info').get() as { count: number }
if (infoCount.count === 0) {
  const sections = [
    { section: 'basic_info', content: JSON.stringify({
      name: '蚁玉梅',
      gender: '女',
      birth: '2002.12',
      hometown: '广东汕头',
      education: '硕士',
      school: '广东工业大学',
      political: '中共党员'
    }), sort_order: 1 },
    { section: 'experience', content: JSON.stringify({
      title: 'Experience / 经历',
      items: []
    }), sort_order: 2 },
    { section: 'skillsets', content: JSON.stringify({
      title: 'Skillsets / 技能',
      items: []
    }), sort_order: 3 },
    { section: 'honors', content: JSON.stringify({
      title: 'honors',
      items: []
    }), sort_order: 4 }
  ]
  const insertStmt = db.prepare('INSERT INTO personal_info (section, content, sort_order) VALUES (?, ?, ?)')
  for (const s of sections) {
    insertStmt.run(s.section, s.content, s.sort_order)
  }
}

// Seed default site settings
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number }
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)')
  insertSetting.run('site_name', 'YUMEI YI')
  insertSetting.run('site_subtitle', 'PORTFOLIO')
}

export default db
