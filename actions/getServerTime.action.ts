'use server'

export async function getServerTime(): Promise<number> {
  return Date.now()
}
