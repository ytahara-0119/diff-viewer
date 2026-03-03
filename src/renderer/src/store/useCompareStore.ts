import { create } from 'zustand'
import type { DiffEntry, CompareStatus, FilterMode, CompareProgress, SummaryCounts } from '../types'

interface CompareState {
  folderA: string
  folderB: string
  compareStatus: CompareStatus
  results: DiffEntry[]
  filter: FilterMode
  selectedFile: DiffEntry | null
  summaryCounts: SummaryCounts
  progress: CompareProgress
  errorMessage: string | null

  // Actions
  setFolderA: (path: string) => void
  setFolderB: (path: string) => void
  setFilter: (filter: FilterMode) => void
  selectFile: (entry: DiffEntry | null) => void
  reset: () => void
  startCompare: () => void
  setResults: (results: DiffEntry[]) => void
  setError: (message: string) => void
  setProgress: (progress: CompareProgress) => void

  // Derived
  filteredResults: () => DiffEntry[]
}

function computeSummary(results: DiffEntry[]): SummaryCounts {
  return results.reduce(
    (acc, entry) => {
      acc[entry.status]++
      return acc
    },
    { added: 0, removed: 0, modified: 0, identical: 0 }
  )
}

export const useCompareStore = create<CompareState>((set, get) => ({
  folderA: '',
  folderB: '',
  compareStatus: 'idle',
  results: [],
  filter: 'all',
  selectedFile: null,
  summaryCounts: { added: 0, removed: 0, modified: 0, identical: 0 },
  progress: { scanned: 0, total: 0 },
  errorMessage: null,

  setFolderA: (path) => set({ folderA: path }),
  setFolderB: (path) => set({ folderB: path }),
  setFilter: (filter) => set({ filter }),
  selectFile: (entry) => set({ selectedFile: entry }),
  reset: () =>
    set({
      compareStatus: 'idle',
      results: [],
      selectedFile: null,
      summaryCounts: { added: 0, removed: 0, modified: 0, identical: 0 },
      progress: { scanned: 0, total: 0 },
      errorMessage: null
    }),

  startCompare: () => {
    const { folderA, folderB } = get()
    if (!folderA || !folderB) return

    set({ compareStatus: 'running', results: [], selectedFile: null, errorMessage: null })

    const api = window.electronAPI

    // Clean up previous listeners
    api.removeAllListeners('compareProgress')
    api.removeAllListeners('compareResult')
    api.removeAllListeners('compareError')

    api.onProgress((_event, progress) => {
      set({ progress })
    })

    api.onResult((_event, results) => {
      const typedResults = results as DiffEntry[]
      set({
        results: typedResults,
        compareStatus: 'completed',
        summaryCounts: computeSummary(typedResults),
        progress: { scanned: typedResults.length, total: typedResults.length }
      })
    })

    api.onError((_event, message) => {
      set({ compareStatus: 'error', errorMessage: message })
    })

    api.startCompare(folderA, folderB)
  },

  setResults: (results) =>
    set({
      results,
      compareStatus: 'completed',
      summaryCounts: computeSummary(results)
    }),

  setError: (message) => set({ compareStatus: 'error', errorMessage: message }),

  setProgress: (progress) => set({ progress }),

  filteredResults: () => {
    const { results, filter } = get()
    if (filter === 'all') return results
    return results.filter((entry) => entry.status === filter)
  }
}))
