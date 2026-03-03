import React from 'react'
import { FolderSelector } from './components/FolderSelector'
import { DiffTree } from './components/DiffTree'
import { DetailView } from './components/DetailView'
import { StatusBar } from './components/StatusBar'

export default function App(): React.ReactElement {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top toolbar */}
      <FolderSelector />

      {/* Main content: tree + detail */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: Diff Tree (40%) */}
        <div className="w-2/5 border-r border-gray-300 overflow-hidden flex flex-col">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
            Files
          </div>
          <div className="flex-1 overflow-hidden">
            <DiffTree />
          </div>
        </div>

        {/* Right pane: Detail View (60%) */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
            Detail
          </div>
          <div className="flex-1 overflow-hidden">
            <DetailView />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
