import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export interface Project {
  id: number
  title: string
  subtitle: string | null
  description: string | null
  category: string | null
  year: string | null
  cover_image: string | null
  envelope_image: string | null
  pdf_file: string | null
  tags: string | null
  is_featured: number
  sort_order: number
  created_at: string
  updated_at: string
  pages?: ProjectPage[]
}

export interface ProjectPage {
  id: number
  project_id: number
  page_number: number
  image_path: string
}

export interface PersonalSection {
  id: number
  section: string
  content: any
  sort_order: number
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const projects = ref<Project[]>([])
  const personalInfo = ref<PersonalSection[]>([])
  const loading = ref(false)

  async function fetchProjects() {
    loading.value = true
    try {
      const res = await api.get('/projects')
      projects.value = res.data
    } catch (e) {
      console.error('Failed to fetch projects:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: number): Promise<Project | null> {
    try {
      const res = await api.get(`/projects/${id}`)
      return res.data
    } catch (e) {
      console.error('Failed to fetch project:', e)
      return null
    }
  }

  async function fetchPersonalInfo() {
    try {
      const res = await api.get('/personal')
      personalInfo.value = res.data
    } catch (e) {
      console.error('Failed to fetch personal info:', e)
    }
  }

  return { projects, personalInfo, loading, fetchProjects, fetchProject, fetchPersonalInfo }
})
