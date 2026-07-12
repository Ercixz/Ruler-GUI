import { create } from 'zustand'
import type { ThemeMode, LocaleCode } from '@shared/types'
import zh from '@/i18n/zh'
import en from '@/i18n/en'
import type { Translations } from '@/i18n/zh'

export interface Component {
  id: string
  title: string
  content: string
  category: string
  globalHead: boolean
  globalTail: boolean
}

export interface ProjectState {
  path: string
  name: string
  componentIds: string[]
  agents: string[]
}

interface AppState {
  theme: ThemeMode; locale: LocaleCode; t: Translations
  components: Component[]; projects: ProjectState[]; activeProjectPath: string | null
  editingComponentId: string | null; previewingPath: string | null; poolCollapsed: boolean
  pinnedAgentIds: string[]

  setTheme: (t: ThemeMode) => void; setLocale: (l: LocaleCode) => void
  addComponent: (c: Component) => void
  setComponents: (components: Component[]) => void
  updateComponent: (id: string, p: Partial<Component>) => void
  removeComponent: (id: string) => void
  setEditingComponent: (id: string | null) => void
  addProject: (path: string) => void
  removeProject: (path: string) => void
  assignComponent: (projectPath: string, componentId: string) => void
  unassignComponent: (projectPath: string, componentId: string) => void
  reorderComponents: (projectPath: string, componentIds: string[]) => void
  setProjectAgents: (projectPath: string, agents: string[]) => void
  togglePinAgent: (agentId: string) => void
  loadProjectState: (ps: { path: string; componentIds: string[]; agents: string[] }) => void
  setActiveProject: (path: string | null) => void
  setPreviewingPath: (path: string | null) => void
  togglePoolCollapsed: () => void
}

let cid = Date.now()
export const genId = () => `c-${++cid}`
const translations: Record<LocaleCode, Translations> = { zh, en }

export const useAppStore = create<AppState>((set) => ({
  theme: 'system', locale: 'en', t: en,
  components: [], projects: [], activeProjectPath: null,
  editingComponentId: null, previewingPath: null, poolCollapsed: false,
  pinnedAgentIds: [],

  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale, t: translations[locale] }),

  addComponent: (c) => set((s) => ({ components: [...s.components, c] })),
  setComponents: (components) => set({ components }),
  updateComponent: (id, patch) =>
    set((s) => ({ components: s.components.map((c) => c.id === id ? { ...c, ...patch } : c) })),
  removeComponent: (id) =>
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      projects: s.projects.map((p) => ({ ...p, componentIds: p.componentIds.filter((cid) => cid !== id) }))
    })),
  setEditingComponent: (id) => set({ editingComponentId: id }),

  addProject: (path) =>
    set((s) => {
      if (s.projects.find((p) => p.path === path)) return { activeProjectPath: path }
      const name = path.split(/[\\/]/).pop() || path
      const proj: ProjectState = { path, name, componentIds: [], agents: [] }
      return { projects: [...s.projects, proj], activeProjectPath: path }
    }),
  removeProject: (path) =>
    set((s) => {
      const next = s.projects.filter((p) => p.path !== path)
      return { projects: next, activeProjectPath: s.activeProjectPath === path ? (next[0]?.path ?? null) : s.activeProjectPath }
    }),
  assignComponent: (projectPath, componentId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.path === projectPath && !p.componentIds.includes(componentId)
          ? { ...p, componentIds: [...p.componentIds, componentId] } : p)
    })),
  unassignComponent: (projectPath, componentId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.path === projectPath ? { ...p, componentIds: p.componentIds.filter((id) => id !== componentId) } : p)
    })),
  reorderComponents: (projectPath, componentIds) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.path === projectPath ? { ...p, componentIds } : p))
    })),
  setProjectAgents: (projectPath, agents) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.path === projectPath ? { ...p, agents } : p))
    })),
  togglePinAgent: (agentId) =>
    set((s) => ({
      pinnedAgentIds: s.pinnedAgentIds.includes(agentId)
        ? s.pinnedAgentIds.filter((id) => id !== agentId)
        : [...s.pinnedAgentIds, agentId]
    })),
  loadProjectState: (ps) =>
    set((s) => {
      const name = ps.path.split(/[\\/]/).pop() || ps.path
      if (s.projects.find((p) => p.path === ps.path)) {
        return {
          projects: s.projects.map((p) =>
            p.path === ps.path ? { ...p, componentIds: ps.componentIds, agents: ps.agents } : p
          )
        }
      }
      return { projects: [...s.projects, { path: ps.path, name, componentIds: ps.componentIds, agents: ps.agents }], activeProjectPath: ps.path }
    }),
  setActiveProject: (path) => set({ activeProjectPath: path, previewingPath: null }),
  setPreviewingPath: (path) => set({ previewingPath: path }),
  togglePoolCollapsed: () => set((s) => ({ poolCollapsed: !s.poolCollapsed }))
}))
