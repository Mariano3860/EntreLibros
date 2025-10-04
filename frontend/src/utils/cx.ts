export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, unknown>

export function cx(...args: ClassValue[]): string {
  const out: string[] = []

  const push = (val: unknown) => {
    if (!val) return
    const t = typeof val
    if (t === 'string' || t === 'number') {
      out.push(String(val))
      return
    }
    if (Array.isArray(val)) {
      for (const v of val) push(v)
      return
    }
    if (t === 'object') {
      for (const [key, v] of Object.entries(val as Record<string, unknown>)) {
        if (v) out.push(key)
      }
    }
  }

  for (const arg of args) push(arg)
  return out.join(' ')
}
