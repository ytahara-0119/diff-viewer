import React from 'react'
import { useCompareStore } from '../store/useCompareStore'
import type { FilterMode } from '../types'

export function FolderSelector(): React.ReactElement {
  const { folderA, folderB, compareStatus, filter, setFolderA, setFolderB, setFilter, startCompare } =
    useCompareStore()

  const isRunning = compareStatus === 'running'

  async function pickFolder(side: 'A' | 'B'): Promise<void> {
    const selected = await window.electronAPI.selectFolder()
    if (selected) {
      if (side === 'A') setFolderA(selected)
      else setFolderB(selected)
    }
  }

  function handleCompare(): void {
    if (folderA && folderB && !isRunning) {
      startCompare()
    }
  }

  function handleCancel(): void {
    window.electronAPI.cancelCompare()
  }

  const filterOptions: { value: FilterMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'added', label: 'Added' },
    { value: 'removed', label: 'Removed' },
    { value: 'modified', label: 'Modified' },
    { value: 'identical', label: 'Identical' }
  ]

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 border-b border-gray-300 flex-wrap">
      {/* Folder A */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <button
          onClick={() => pickFolder('A')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
        >
          Folder A
        </button>
        <span
          className="text-xs text-gray-600 truncate bg-white border border-gray-300 px-2 py-1 rounded flex-1 min-w-0"
          title={folderA || 'No folder selected'}
        >
          {folderA || 'Select a folder…'}
        </span>
      </div>

      {/* Folder B */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <button
          onClick={() => pickFolder('B')}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
        >
          Folder B
        </button>
        <span
          className="text-xs text-gray-600 truncate bg-white border border-gray-300 px-2 py-1 rounded flex-1 min-w-0"
          title={folderB || 'No folder selected'}
        >
          {folderB || 'Select a folder…'}
        </span>
      </div>

      {/* Compare / Cancel */}
      {isRunning ? (
        <button
          onClick={handleCancel}
          className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
        >
          Cancel
        </button>
      ) : (
        <button
          onClick={handleCompare}
          disabled={!folderA || !folderB}
          className="px-4 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Compare
        </button>
      )}

      {/* Filter */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as FilterMode)}
        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
      >
        {filterOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
