import { describe, it, expect } from 'vitest'
import { useAppStore } from '../store/appStore'

describe('AppStore', () => {
  it('starts with empty projects', () => {
    const { projects } = useAppStore.getState()
    expect(projects).toEqual([])
  })

  it('adds project and sets as active', () => {
    const store = useAppStore.getState()
    store.addProject('C:/test/project-a')

    const { projects, activeProjectPath } = useAppStore.getState()
    expect(projects).toHaveLength(1)
    expect(projects[0].path).toBe('C:/test/project-a')
    expect(projects[0].name).toBe('project-a')
    expect(activeProjectPath).toBe('C:/test/project-a')
  })

  it('prevents duplicate projects', () => {
    useAppStore.getState().addProject('C:/test/project-a')
    useAppStore.getState().addProject('C:/test/project-a')

    const { projects } = useAppStore.getState()
    expect(projects).toHaveLength(1)
  })

  it('adds and removes components', () => {
    const store = useAppStore.getState()
    store.addComponent({ id: 'c1', title: 'Test', content: '# Test', category: 'General' })

    expect(useAppStore.getState().components).toHaveLength(1)
    expect(useAppStore.getState().components[0].title).toBe('Test')

    store.removeComponent('c1')
    expect(useAppStore.getState().components).toHaveLength(0)
  })

  it('assigns components to projects', () => {
    useAppStore.getState().addProject('C:/test/project-b')
    const store = useAppStore.getState()
    store.addComponent({ id: 'c2', title: 'Security', content: '# Security', category: 'Security' })
    store.assignComponent('C:/test/project-b', 'c2')

    const project = useAppStore.getState().projects.find((p) => p.path === 'C:/test/project-b')
    expect(project?.componentIds).toContain('c2')
  })

  it('toggles theme', () => {
    useAppStore.getState().setTheme('dark')
    expect(useAppStore.getState().theme).toBe('dark')

    useAppStore.getState().setTheme('light')
    expect(useAppStore.getState().theme).toBe('light')
  })

  it('sets project agents', () => {
    const store = useAppStore.getState()
    store.setProjectAgents('C:/test/project-b', ['claude', 'copilot'])

    const project = useAppStore.getState().projects.find((p) => p.path === 'C:/test/project-b')
    expect(project?.agents).toEqual(['claude', 'copilot'])
  })

  it('reorders components in a project', () => {
    const store = useAppStore.getState()
    store.assignComponent('C:/test/project-b', 'c3')
    store.reorderComponents('C:/test/project-b', ['c3', 'c2'])

    const project = useAppStore.getState().projects.find((p) => p.path === 'C:/test/project-b')
    expect(project?.componentIds).toEqual(['c3', 'c2'])
  })
})
