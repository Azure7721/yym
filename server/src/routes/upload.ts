import { Router, Request, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = file.fieldname === 'pdf' ? 'pdfs' : 'images'
    const dir = path.join(__dirname, '..', '..', 'uploads', subDir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
})

const router = Router()

// POST /api/upload/image - Upload single image
router.post('/image', authMiddleware, upload.single('image'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '请选择文件' })
    return
  }
  res.json({ path: '/uploads/images/' + req.file.filename })
})

// POST /api/upload/pdf - Upload PDF
router.post('/pdf', authMiddleware, upload.single('pdf'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '请选择文件' })
    return
  }
  res.json({ path: '/uploads/pdfs/' + req.file.filename })
})

export default router
