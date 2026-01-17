import CodingStatusClient from './CodingStatusClient'
import { WorkspaceStatus } from '@/constants/types'

const CodingStatus = async () => {
  let data: WorkspaceStatus | null = null

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/vscodeStatus`,
      { cache: 'no-store' }
    )

    if (res.ok && res.status !== 204) {
      const json = await res.json()
      data = json.status ?? null
    }
  } catch {
    data = null
  }

  return <CodingStatusClient initialData={data} />
}

export default CodingStatus
