import { useState, useEffect, useCallback } from 'react'

// ViewModel instance interface
interface ViewModelState {
  instanceId?: string
  viewId?: string
  properties?: Record<string, unknown>
  actions?: string[]
  listenedProperties?: string[]
}

// Property change event
interface PropertyChangeEvent {
  instanceId: string
  viewId: string
  propName: string
  value: unknown
}

// Return type for the hook
interface UseMVVMReturn {
  viewModel: ViewModelState
  isReady: boolean
  error: string | null
  properties: Record<string, unknown>
  viewId: string | undefined
  addPropertyListener: (propName: string) => Promise<void>
  executeAction: (actionName: string, ...args: unknown[]) => Promise<unknown>
  getProp: (propName: string) => unknown
}

export function useMVVM(viewModelType: string): UseMVVMReturn {
  const [viewModel, setViewModel] = useState<ViewModelState>({})
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize ViewModel
  useEffect(() => {
    let mounted = true

    async function initViewModel(): Promise<void> {
      try {
        // Create ViewModel instance
        const result = await window.electron.ipcRenderer.invoke(
          'mvvm:createViewModel',
          viewModelType
        )

        if (!mounted) return

        if (result.success) {
          const initialState = await window.electron.ipcRenderer.invoke(
            'mvvm:getState',
            result.instanceId
          )

          if (initialState.success && mounted) {
            setViewModel({
              instanceId: result.instanceId,
              viewId: result.viewId,
              properties: initialState.state.properties || {},
              actions: initialState.state.actions || [],
              listenedProperties: initialState.state.listenedProperties || []
            })
            setIsReady(true)
          }
        } else {
          setError(result.error || 'Failed to create ViewModel')
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    initViewModel()

    return () => {
      mounted = false
      // Cleanup ViewModel instance
      if (viewModel.instanceId) {
        window.electron.ipcRenderer.invoke('mvvm:removeViewModel', viewModel.instanceId)
      }
    }
  }, [viewModelType])

  // Listen for property changes
  useEffect(() => {
    if (!viewModel.instanceId) return

    function handlePropertyChange(event: unknown, changeInfo: PropertyChangeEvent): void {
      if (changeInfo.instanceId === viewModel.instanceId) {
        setViewModel((prev) => ({
          ...prev,
          properties: {
            ...prev.properties,
            [changeInfo.propName]: changeInfo.value
          }
        }))
      }
    }

    window.electron.ipcRenderer.on('mvvm:propertyChanged', handlePropertyChange)

    return () => {
      window.electron.ipcRenderer.removeListener('mvvm:propertyChanged', handlePropertyChange)
    }
  }, [viewModel.instanceId])

  // Add property listener
  const addPropertyListener = useCallback(
    async (propName: string): Promise<void> => {
      if (!viewModel.instanceId) return

      try {
        await window.electron.ipcRenderer.invoke(
          'mvvm:addPropertyListener',
          viewModel.instanceId,
          propName
        )
      } catch (err) {
        console.error('Failed to add property listener:', err)
      }
    },
    [viewModel.instanceId]
  )

  // Execute action
  const executeAction = useCallback(
    async (actionName: string, ...args: unknown[]): Promise<unknown> => {
      if (!viewModel.instanceId) return

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'mvvm:executeAction',
          viewModel.instanceId,
          actionName,
          ...args
        )
        return result
      } catch (err) {
        console.error('Failed to execute action:', err)
        throw err
      }
    },
    [viewModel.instanceId]
  )

  // Get property value
  const getProp = useCallback(
    (propName: string): unknown => {
      return viewModel.properties?.[propName]
    },
    [viewModel.properties]
  )

  return {
    // State
    viewModel,
    isReady,
    error,

    // Properties
    properties: viewModel.properties || {},
    viewId: viewModel.viewId,

    // Methods
    addPropertyListener,
    executeAction,
    getProp
  }
}
