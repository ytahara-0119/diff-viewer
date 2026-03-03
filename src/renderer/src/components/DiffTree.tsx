import React from 'react'
import { useCompareStore } from '../store/useCompareStore'
import type { DiffEntry, FileStatus } from '../types'

const STATUS_COLORS: Record<FileStatus, string> = {
  added: 'text-green-700 bg-green-50',
  removed: 'text-red-700 bg-red-50',
  modified: 'text-yellow-700 bg-yellow-50',
  identical: 'text-gray-500'
}

const STATUS_BADGE: Record<FileStatus, string> = {
  added: 'A',
  removed: 'D',
  modified: 'M',
  identical: '='
}

const STATUS_BADGE_COLORS: Record<FileStatus, string> = {
  added: 'bg-green-500 text-white',
  removed: 'bg-red-500 text-white',
  modified: 'bg-yellow-500 text-white',
  identical: 'bg-gray-300 text-gray-600'
}

function getDepth(relPath: string): number {
  return relPath.split('/').length - 1
}

function getBasename(relPath: string): string {
  return relPath.split('/').pop() ?? relPath
}

interface TreeRowProps {
  entry: DiffEntry
  isSelected: boolean
  onClick: () => void
}

function TreeRow({ entry, isSelected, onClick }: TreeRowProps): React.ReactElement {
  const depth = getDepth(entry.relativePath)
  const name = getBasename(entry.relativePath)
  const colorClass = STATUS_COLORS[entry.status]
  const badge = STATUS_BADGE[entry.status]
  const badgeColor = STATUS_BADGE_COLORS[entry.status]

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer text-xs hover:bg-gray-100 ${
        isSelected ? 'bg-blue-100 hover:bg-blue-100' : ''
      } ${colorClass}`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      <span className={`flex-shrink-0 w-4 h-4 rounded text-center leading-4 font-bold text-xs ${badgeColor}`}>
        {badge}
      </span>
      <span className={`mr-1 ${entry.isDirectory ? 'text-blue-500' : ''}`}>
        {entry.isDirectory ? '📁' : '📄'}
      </span>
      <span className="truncate flex-1" title={entry.relativePath}>
        {name}
      </span>
    </div>
  )
}

export function DiffTree(): React.ReactElement {
  const { compareStatus, selectedFile, selectFile, filteredResults } = useCompareStore()
  const entries = filteredResults()

  if (compareStatus === 'idle') {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Select folders and click Compare
      </div>
    )
  }

  if (compareStatus === 'running' && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Scanning…
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No files match the current filter
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      {entries.map((entry) => (
        <TreeRow
          key={entry.relativePath}
          entry={entry}
          isSelected={selectedFile?.relativePath === entry.relativePath}
          onClick={() => selectFile(entry)}
        />
      ))}
    </div>
  )
}
