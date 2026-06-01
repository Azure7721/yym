import { Router, Request, Response } from 'express'
import db from '../database.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'pdf' ? 'pdfs' : 'images'
    const dir = path.join(uploadsDir, subDir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true)
      } else {
        cb(new Error('只允许上传PDF文件'))
      }
    } else {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(new Error('只允许上传图片文件'))
      }
    }
  }
})

const router = Router()

// GET /api/projects - Get all projects (public)
router.get('/', (req: Request, res: Response) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all()
  res.json(projects)
})

// GET /api/projects/:id - Get single project (public)
router.get('/:id', (req: Request, res: Response) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id)
  if (!project) {
    res.status(404).json({ error: '项目不存在' })
    return
  }

  const pages = db.prepare('SELECT * FROM project_pages WHERE project_id = ? ORDER BY page_number ASC').all(req.params.id)
  res.json({ ...(project as any), pages })
})

// POST /api/projects - Create project (admin)
router.post('/', authMiddleware, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'envelope', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), (req: AuthRequest, res: Response) => {
  const { title, subtitle, description, category, year, tags, is_featured } = req.body
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  if (!title) {
    res.status(400).json({ error: '请输入项目名称' })
    return
  }

  const coverPath = files?.cover?.[0] ? '/uploads/images/' + files.cover[0].filename : null
  const envelopePath = files?.envelope?.[0] ? '/uploads/images/' + files.envelope[0].filename : null
  const pdfPath = files?.pdf?.[0] ? '/uploads/pdfs/' + files.pdf[0].filename : null

  const maxOrder = db.prepare('SELECT MAX(sort_order) as max_order FROM projects').get() as any
  const sortOrder = (maxOrder?.max_order || 0) + 1

  const result = db.prepare(`
    INSERT INTO projects (title, subtitle, description, category, year, cover_image, envelope_image, pdf_file, tags, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    subtitle || null,
    description || null,
    category || null,
    year || null,
    coverPath,
    envelopePath,
    pdfPath,
    tags || null,
    is_featured ? 1 : 0,
    sortOrder
  )

  res.json({ id: result.lastInsertRowid, message: '项目创建成功' })
})

// PUT /api/projects/:id - Update project (admin)
router.put('/:id', authMiddleware, upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'envelope', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any
  if (!existing) {
    res.status(404).json({ error: '项目不存在' })
    return
  }

  const { title, subtitle, description, category, year, tags, is_featured } = req.body
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  const coverPath = files?.cover?.[0]
    ? '/uploads/images/' + files.cover[0].filename
    : existing.cover_image

  const envelopePath = files?.envelope?.[0]
    ? '/uploads/images/' + files.envelope[0].filename
    : existing.envelope_image

  const pdfPath = files?.pdf?.[0]
    ? '/uploads/pdfs/' + files.pdf[0].filename
    : existing.pdf_file

  // Delete old files if new ones uploaded
  if (files?.cover?.[0] && existing.cover_image) {
    const oldPath = path.join(__dirname, '..', '..', existing.cover_image)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }
  if (files?.envelope?.[0] && existing.envelope_image) {
    const oldPath = path.join(__dirname, '..', '..', existing.envelope_image)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }
  if (files?.pdf?.[0] && existing.pdf_file) {
    const oldPath = path.join(__dirname, '..', '..', existing.pdf_file)
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
  }

  db.prepare(`
    UPDATE projects SET
      title = ?, subtitle = ?, description = ?, category = ?, year = ?,
      cover_image = ?, envelope_image = ?, pdf_file = ?, tags = ?, is_featured = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || existing.title,
    subtitle ?? existing.subtitle,
    description ?? existing.description,
    category ?? existing.category,
    year ?? existing.year,
    coverPath,
    envelopePath,
    pdfPath,
    tags ?? existing.tags,
    is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
    req.params.id
  )

  res.json({ message: '项目更新成功' })
})

// DELETE /api/projects/:id - Delete project (admin)
router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any
  if (!existing) {
    res.status(404).json({ error: '项目不存在' })
    return
  }

  // Delete associated files
  if (existing.cover_image) {
    const filePath = path.join(__dirname, '..', '..', existing.cover_image)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  if (existing.envelope_image) {
    const filePath = path.join(__dirname, '..', '..', existing.envelope_image)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  if (existing.pdf_file) {
    const filePath = path.join(__dirname, '..', '..', existing.pdf_file)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  // Delete project pages images
  const pages = db.prepare('SELECT * FROM project_pages WHERE project_id = ?').all(req.params.id) as any[]
  for (const page of pages) {
    const filePath = path.join(__dirname, '..', '..', page.image_path)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  db.prepare('DELETE FROM project_pages WHERE project_id = ?').run(req.params.id)
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)

  res.json({ message: '项目删除成功' })
})

export default router
