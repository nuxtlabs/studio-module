import type { DraftFile, PreviewFile } from '../../../types'

export const mergeDraft = (dbFiles: PreviewFile[] = [], draftAdditions: DraftFile[], draftDeletions: DraftFile[]) => {
  const additions = [...(draftAdditions || [])]
  const deletions = [...(draftDeletions || [])]

  // Compute file name
  const mergedFiles: PreviewFile[] = JSON.parse(JSON.stringify(dbFiles))

  // Merge darft additions
  for (const addition of additions) {
    // File has been renamed
    if (addition.oldPath) {
      // Remove old file from deletions (only display renamed one)
      deletions.splice(deletions.findIndex(d => d.path === addition.oldPath), 1)

      // Custom case of #447
      const oldPathExistInCache = additions.find(a => a.path === addition.oldPath)
      if (oldPathExistInCache) {
        mergedFiles.push({ path: addition.path, parsed: addition.parsed })
        // Update exsiting renamed file data
      } else {
        const file = mergedFiles.find(f => f.path === addition.oldPath)
        if (file) {
          file.path = addition.path

          // If file is also modified, set draft content
          if (addition.parsed) {
            file.parsed = addition.parsed
          } else if (addition.pathMeta) {
            // Apply new path metadata
            ['_file', '_path', '_id', '_locale'].forEach((key) => {
              file.parsed![key] = addition.pathMeta![key]
            })
          }
        }
      }
      // File has been added
    } else if (addition.new) {
      mergedFiles.push({ path: addition.path, parsed: addition.parsed })
      // File has been modified
    } else {
      const file = mergedFiles.find(f => f.path === addition.path)
      if (file) {
        Object.assign(file, { path: addition.path, parsed: addition.parsed })
      }
    }
  }

  // Merge draft deletions (set deletion status)
  for (const deletion of deletions) {
    // File has been deleted
    mergedFiles.splice(mergedFiles.findIndex(f => f.path === deletion.path), 1)
  }

  const comperable = new Intl.Collator(undefined, { numeric: true })
  mergedFiles.sort((a, b) => comperable.compare(a.path, b.path))

  return mergedFiles
}
