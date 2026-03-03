import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { diffLines } from 'diff'

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
  textDiff?: DiffLine[]
  sizeA?: number
  sizeB?: number
  hashA?: string
  hashB?: string
  mtimeA?: number
  mtimeB?: number
}

export interface CompareProgress {
  scanned: number
  total: number
}

type ProgressCallback = (progress: CompareProgress) => void

let cancelFlag = false

export function cancelCompare(): void {
  cancelFlag = true
}

/**
 * Recursively collect all file paths relative to baseDir.
 */
function collectPaths(baseDir: string): Map<string, fs.Stats> {
  const result = new Map<string, fs.Stats>()

  function walk(dir: string): void {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.relative(baseDir, fullPath)
      try {
        const stat = fs.statSync(fullPath)
        result.set(relPath, stat)
        if (entry.isDirectory()) {
          walk(fullPath)
        }
      } catch {
        // Skip inaccessible files
      }
    }
  }

  walk(baseDir)
  return result
}

/**
 * Check if file is binary by scanning first 8000 bytes for NULL bytes.
 */
function isBinaryFile(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buf = Buffer.alloc(8000)
    const bytesRead = fs.readSync(fd, buf, 0, 8000, 0)
    fs.closeSync(fd)
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0) return true
    }
    return false
  } catch {
    return true
  }
}

/**
 * Compute SHA-256 hash of a file using streams.
 */
function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

/**
 * Generate line-by-line diff for two text files.
 */
function generateTextDiff(pathA: string, pathB: string): DiffLine[] {
  try {
    const contentA = fs.readFileSync(pathA, 'utf-8')
    const contentB = fs.readFileSync(pathB, 'utf-8')
    const changes = diffLines(contentA, contentB)
    const result: DiffLine[] = []
    let lineNo = 1
    for (const change of changes) {
      const lines = change.value.split('\n')
      // Remove trailing empty string caused by trailing newline
      if (lines[lines.length - 1] === '') lines.pop()
      for (const line of lines) {
        if (change.added) {
          result.push({ type: 'added', content: line, lineNo: lineNo++ })
        } else if (change.removed) {
          result.push({ type: 'removed', content: line })
        } else {
          result.push({ type: 'unchanged', content: line, lineNo: lineNo++ })
        }
      }
    }
    return result
  } catch {
    return []
  }
}

/**
 * Main compare function. Returns array of DiffEntry.
 */
export async function compareDirectories(
  folderA: string,
  folderB: string,
  onProgress: ProgressCallback
): Promise<DiffEntry[]> {
  cancelFlag = false

  const pathsA = collectPaths(folderA)
  const pathsB = collectPaths(folderB)

  const allPaths = new Set([...pathsA.keys(), ...pathsB.keys()])
  const total = allPaths.size
  let scanned = 0

  const results: DiffEntry[] = []

  for (const relPath of allPaths) {
    if (cancelFlag) break

    scanned++
    onProgress({ scanned, total })

    const statA = pathsA.get(relPath)
    const statB = pathsB.get(relPath)

    const isDir = (statA?.isDirectory() ?? false) || (statB?.isDirectory() ?? false)

    if (!statB) {
      // Exists only in A → added
      results.push({
        relativePath: relPath,
        status: 'added',
        isDirectory: isDir,
        sizeA: statA?.size,
        mtimeA: statA?.mtimeMs
      })
      continue
    }

    if (!statA) {
      // Exists only in B → removed
      results.push({
        relativePath: relPath,
        status: 'removed',
        isDirectory: isDir,
        sizeB: statB?.size,
        mtimeB: statB?.mtimeMs
      })
      continue
    }

    // Both exist
    if (isDir) {
      results.push({ relativePath: relPath, status: 'identical', isDirectory: true })
      continue
    }

    const fullA = path.join(folderA, relPath)
    const fullB = path.join(folderB, relPath)

    // Stage 1: size comparison
    if (statA.size !== statB.size) {
      const entry: DiffEntry = {
        relativePath: relPath,
        status: 'modified',
        isDirectory: false,
        sizeA: statA.size,
        sizeB: statB.size,
        mtimeA: statA.mtimeMs,
        mtimeB: statB.mtimeMs
      }
      if (!isBinaryFile(fullA) && !isBinaryFile(fullB)) {
        entry.textDiff = generateTextDiff(fullA, fullB)
      } else {
        try {
          const [hA, hB] = await Promise.all([hashFile(fullA), hashFile(fullB)])
          entry.hashA = hA
          entry.hashB = hB
        } catch { /* ignore */ }
      }
      results.push(entry)
      continue
    }

    // Stage 2: mtime comparison — if same mtime assume identical
    if (Math.abs(statA.mtimeMs - statB.mtimeMs) < 1) {
      results.push({
        relativePath: relPath,
        status: 'identical',
        isDirectory: false,
        sizeA: statA.size,
        sizeB: statB.size,
        mtimeA: statA.mtimeMs,
        mtimeB: statB.mtimeMs
      })
      continue
    }

    // Stage 3: hash comparison
    let hashA: string
    let hashB: string
    try {
      ;[hashA, hashB] = await Promise.all([hashFile(fullA), hashFile(fullB)])
    } catch {
      // On error, mark as modified
      results.push({
        relativePath: relPath,
        status: 'modified',
        isDirectory: false,
        sizeA: statA.size,
        sizeB: statB.size,
        mtimeA: statA.mtimeMs,
        mtimeB: statB.mtimeMs
      })
      continue
    }

    if (hashA === hashB) {
      results.push({
        relativePath: relPath,
        status: 'identical',
        isDirectory: false,
        sizeA: statA.size,
        sizeB: statB.size,
        hashA,
        hashB,
        mtimeA: statA.mtimeMs,
        mtimeB: statB.mtimeMs
      })
    } else {
      const entry: DiffEntry = {
        relativePath: relPath,
        status: 'modified',
        isDirectory: false,
        sizeA: statA.size,
        sizeB: statB.size,
        hashA,
        hashB,
        mtimeA: statA.mtimeMs,
        mtimeB: statB.mtimeMs
      }
      if (!isBinaryFile(fullA) && !isBinaryFile(fullB)) {
        entry.textDiff = generateTextDiff(fullA, fullB)
      }
      results.push(entry)
    }
  }

  // Sort: directories first, then by path
  results.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.relativePath.localeCompare(b.relativePath)
  })

  return results
}
