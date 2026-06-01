import { Router, Request, Response } from 'express'
import db from '../database.js'
import { authMiddleware, AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/daily - Get daily page data (public)
router.get('/', (req: Request, res: Response) => {
  const titleSetting = db.prepare("SELECT value FROM site_settings WHERE key = 'daily_title'").get() as any
  const subtitleSetting = db.prepare("SELECT value FROM site_settings WHERE key = 'daily_subtitle'").get() as any
  const boardsSetting = db.prepare("SELECT value FROM site_settings WHERE key = 'daily_boards'").get() as any

  res.json({
    title: titleSetting?.value || '跨界技能与设计思维的延展',
    subtitle: subtitleSetting?.value || 'Extensions of cross-disciplinary\nskills and design thinking',
    boards: boardsSetting ? JSON.parse(boardsSetting.value) : []
  })
})

// PUT /api/daily - Update daily page data (admin)
router.put('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const { title, subtitle, boards } = req.body

  const upsert = db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `)

  if (title !== undefined) upsert.run('daily_title', title)
  if (subtitle !== undefined) upsert.run('daily_subtitle', subtitle)
  if (boards !== undefined) upsert.run('daily_boards', JSON.stringify(boards))

  res.json({ message: 'Daily页面更新成功' })
})

export default router
