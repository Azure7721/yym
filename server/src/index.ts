import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import personalRoutes from './routes/personal.js'
import uploadRoutes from './routes/upload.js'
import dailyRoutes from './routes/daily.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files - serve uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/personal', personalRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/daily', dailyRoutes)

// Serve frontend in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(clientDist, 'index.html'))
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
