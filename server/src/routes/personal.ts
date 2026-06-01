import { Router, Request, Response } from 'express'
import db from '../database.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'images')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const router = Router()

// GET /api/personal - Get all personal info (public)
router.get('/', (req: Request, res: Response) => {
  const sections = db.prepare('SELECT * FROM personal_info ORDER BY sort_order ASC').all()
  const parsed = sections.map((s: any) => ({
    ...s,
    content: JSON.parse(s.content)
  }))
  res.json(parsed)
})

// GET /api/personal/:section - Get specific section (public)
router.get('/:section', (req: Request, res: Response) => {
  const section = db.prepare('SELECT * FROM personal_info WHERE section = ?').get(req.params.section) as any
  if (!section) {
    res.status(404).json({ error: '板块不存在' })
    return
  }
  res.json({ ...section, content: JSON.parse(section.content) })
})

// PUT /api/personal/:section - Update section (admin)
router.put('/:section', authMiddleware, (req: AuthRequest, res: Response) => {
  const { content } = req.body
  const existing = db.prepare('SELECT * FROM personal_info WHERE section = ?').get(req.params.section)

  if (!existing) {
    res.status(404).json({ error: '板块不存在' })
    return
  }

  db.prepare('UPDATE personal_info SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ?')
    .run(JSON.stringify(content), req.params.section)

  res.json({ message: '更新成功' })
})

// POST /api/personal/photo - Upload personal photo (admin)
router.post('/photo', authMiddleware, upload.single('photo'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '请选择图片' })
    return
  }

  const photoPath = '/uploads/images/' + req.file.filename

  // Update or insert photo setting
  const existing = db.prepare("SELECT * FROM site_settings WHERE key = 'personal_photo'").get()
  if (existing) {
    // Delete old photo
    const oldSetting = existing as any
    const oldPath = path.join(__dirname, '..', '..', oldSetting.value)
    if (fs.existsSync(oldPath) && oldSetting.value.startsWith('/uploads/')) {
      fs.unlinkSync(oldPath)
    }
    db.prepare("UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'personal_photo'")
      .run(photoPath)
  } else {
    db.prepare("INSERT INTO site_settings (key, value) VALUES ('personal_photo', ?)")
      .run(photoPath)
  }

  res.json({ path: photoPath })
})

// GET /api/personal/photo/current - Get current photo
router.get('/photo/current', (req: Request, res: Response) => {
  const setting = db.prepare("SELECT value FROM site_settings WHERE key = 'personal_photo'").get() as any
  res.json({ path: setting?.value || null })
})

// DELETE /api/personal/photo - Delete personal photo (admin)
router.delete('/photo', authMiddleware, (req: AuthRequest, res: Response) => {
  const setting = db.prepare("SELECT value FROM site_settings WHERE key = 'personal_photo'").get() as any

  if (setting && setting.value) {
    // Delete file from disk
    const filePath = path.join(__dirname, '..', '..', setting.value)
    if (fs.existsSync(filePath) && setting.value.startsWith('/uploads/')) {
      fs.unlinkSync(filePath)
    }

    // Remove from database
    db.prepare("DELETE FROM site_settings WHERE key = 'personal_photo'").run()
  }

  res.json({ message: '照片已删除' })
})

export default router
