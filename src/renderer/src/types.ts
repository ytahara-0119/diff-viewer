export type FileStatus = 'added' | 'removed' | 'modified' | 'identical'

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNo?: number
}

export interface DiffEntry {
  relativePath: string
  status: FileStatus
  isDirectory: boolean
  // Text diff
  textDiff?: DiffLine[]
  // Binary / meta info
  sizeA?: number
  sizeB?: number
  hashA?: string
  hashB?: string
  mtimeA?: number
  mtimeB?: number
}

export type CompareStatus = 'idle' | 'running' | 'completed' | 'error'

export type FilterMode = 'all' | 'added' | 'removed' | 'modified' | 'identical'

export interface CompareProgress {
  scanned: number
  total: number
}

export interface SummaryCounts {
  added: number
  removed: number
  modified: number
  identical: number
}
