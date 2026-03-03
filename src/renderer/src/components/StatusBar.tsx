import React from 'react'
import { useCompareStore } from '../store/useCompareStore'

export function StatusBar(): React.ReactElement {
  const { compareStatus, summaryCounts, progress, errorMessage } = useCompareStore()

  const isRunning = compareStatus === 'running'
  const percent = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0

  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
      {isRunning && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
          <span>
            Scanning… {progress.scanned} / {progress.total} ({percent}%)
          </span>
        </div>
      )}

      {compareStatus === 'completed' && (
        <>
          <CountBadge label="Added" count={summaryCounts.added} color="text-green-700" />
          <CountBadge label="Removed" count={summaryCounts.removed} color="text-red-700" />
          <CountBadge label="Modified" count={summaryCounts.modified} color="text-yellow-700" />
          <CountBadge label="Identical" count={summaryCounts.identical} color="text-gray-500" />
        </>
      )}

      {compareStatus === 'error' && (
        <span className="text-red-600">Error: {errorMessage}</span>
      )}

      {compareStatus === 'idle' && <span className="text-gray-400">Ready</span>}

      <div className="flex-1" />

      {compareStatus === 'completed' && (
        <span className="text-gray-400">
          {summaryCounts.added + summaryCounts.removed + summaryCounts.modified + summaryCounts.identical} items
        </span>
      )}
    </div>
  )
}

function CountBadge({
  label,
  count,
  color
}: {
  label: string
  count: number
  color: string
}): React.ReactElement {
  return (
    <span className={`font-medium ${color}`}>
      {label}: {count}
    </span>
  )
}
