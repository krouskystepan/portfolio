/** Trigger a browser download of a text file (client-side only). */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Read a user-selected text file as UTF-8. */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read file as text.'))
    }
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}

/** Open a hidden file picker and return the chosen file, or null if cancelled. */
export function pickTextFile(accept = '.json,.txt,application/json,text/plain'): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      resolve(input.files?.[0] ?? null)
    }
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}
