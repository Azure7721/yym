import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'yumei-portfolio-secret-key-2024'

export interface AuthRequest extends Request {
  adminId?: number
}

export function generateToken(adminId: number): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '24h' })
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未授权，请先登录' })
    return
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number }
    req.adminId = decoded.adminId
    next()
  } catch {
    res.status(401).json({ error: 'Token已过期，请重新登录' })
  }
}
