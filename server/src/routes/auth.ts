import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database.js'
import { generateToken } from '../middleware/auth.js'

const JWT_SECRET = process.env.JWT_SECRET || 'yumei-portfolio-secret-key-2024'
const router = Router()

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: '请输入用户名和密码' })
    return
  }

  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username) as any
  if (!admin) {
    res.status(401).json({ error: '用户名或密码错误' })
    return
  }

  const validPassword = bcrypt.compareSync(password, admin.password)
  if (!validPassword) {
    res.status(401).json({ error: '用户名或密码错误' })
    return
  }

  const token = generateToken(admin.id)
  res.json({ token, username: admin.username })
})

// GET /api/auth/verify
router.get('/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ valid: false })
    return
  }

  try {
    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    res.json({ valid: true })
  } catch {
    res.status(401).json({ valid: false })
  }
})

export default router
