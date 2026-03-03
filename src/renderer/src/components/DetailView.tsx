import React from 'react'
import { useCompareStore } from '../store/useCompareStore'
import type { DiffLine } from '../types'

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ms: number | undefined): string {
  if (ms === undefined) return '—'
  return new Date(ms).toLocaleString()
}

function LineRow({ line }: { line: DiffLine }): React.ReactElement {
  const bgClass =
    line.type === 'added'
      ? 'bg-green-50 text-green-800'
      : line.type === 'removed'
        ? 'bg-red-50 text-red-800'
        : 'text-gray-700'

  const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '

  return (
    <div className={`flex font-mono text-xs leading-5 ${bgClass}`}>
      <span className="w-8 text-right pr-2 text-gray-400 select-none flex-shrink-0">
        {line.lineNo ?? ''}
      </span>
      <span className="w-4 text-center flex-shrink-0">{prefix}</span>
      <span className="flex-1 whitespace-pre">{line.content}</span>
    </div>
  )
}

export function DetailView(): React.ReactElement {
  const { selectedFile, folderA, folderB } = useCompareStore()

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Select a file to view details
      </div>
    )
  }

  const { relativePath, status, isDirectory, textDiff, sizeA, sizeB, hashA, hashB, mtimeA, mtimeB } =
    selectedFile

  // Directory node
  if (isDirectory) {
    return (
      <div className="p-4 h-full overflow-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 truncate">{relativePath}</h2>
        <p className="text-xs text-gray-500">Directory</p>
      </div>
    )
  }

  // Text diff view
  if (textDiff && textDiff.length > 0) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600 truncate flex-1">{relativePath}</span>
          <StatusChip status={status} />
        </div>
        <div className="flex-1 overflow-auto">
          {textDiff.map((line, i) => (
            <LineRow key={i} line={line} />
          ))}
        </div>
      </div>
    )
  }

  // Binary / meta view
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 truncate flex-1">{relativePath}</h2>
        <StatusChip status={status} />
      </div>
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border border-gray-200 w-24">Field</th>
            <th className="text-left p-2 border border-gray-200">
              {folderA || 'Folder A'}
            </th>
            <th className="text-left p-2 border border-gray-200">
              {folderB || 'Folder B'}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-gray-200 font-medium text-gray-600">Size</td>
            <td className="p-2 border border-gray-200 font-mono">{formatBytes(sizeA)}</td>
            <td className="p-2 border border-gray-200 font-mono">{formatBytes(sizeB)}</td>
          </tr>
          <tr className="bg-gray-50">
            <td className="p-2 border border-gray-200 font-medium text-gray-600">Modified</td>
            <td className="p-2 border border-gray-200">{formatDate(mtimeA)}</td>
            <td className="p-2 border border-gray-200">{formatDate(mtimeB)}</td>
          </tr>
          <tr>
            <td className="p-2 border border-gray-200 font-medium text-gray-600">SHA-256</td>
            <td className="p-2 border border-gray-200 font-mono break-all text-gray-500">
              {hashA ?? '—'}
            </td>
            <td className="p-2 border border-gray-200 font-mono break-all text-gray-500">
              {hashB ?? '—'}
            </td>
          </tr>
        </tbody>
      </table>
      {status === 'added' && (
        <p className="mt-3 text-xs text-green-700">This file exists only in Folder A.</p>
      )}
      {status === 'removed' && (
        <p className="mt-3 text-xs text-red-700">This file exists only in Folder B.</p>
      )}
      {status === 'modified' && !textDiff && (
        <p className="mt-3 text-xs text-yellow-700">Binary file — content differs.</p>
      )}
    </div>
  )
}

function StatusChip({ status }: { status: string }): React.ReactElement {
  const colors: Record<string, string> = {
    added: 'bg-green-100 text-green-700',
    removed: 'bg-red-100 text-red-700',
    modified: 'bg-yellow-100 text-yellow-700',
    identical: 'bg-gray-100 text-gray-600'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  )
}
