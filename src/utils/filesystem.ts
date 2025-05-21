export async function readFile(path: string): Promise<string> {
  const response = await fetch(path, { headers: { Accept: 'text/plain' } })
  if (!response.ok) return ''
  return await response.text()
}
