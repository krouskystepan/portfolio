import { WorkspaceStatus } from '@/constants/types'
import { db } from '@/utils/firebase'
import { verifyGithubToken } from '@/utils/utils'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function GET() {
  const codingSessionRef = doc(db, 'codingSession', 'currentSession')
  const codingSessionSnap = await getDoc(codingSessionRef)
  const workSpace: WorkspaceStatus = codingSessionSnap.data()?.status

  const currentTime = new Date()
  const lastUpdateTime = new Date(workSpace?.lastUpdate)
  const timeDifference = currentTime.getTime() - lastUpdateTime.getTime()

  if (timeDifference > 65_000 || !workSpace) {
    return NextResponse.json({ workSpace: null }, { status: 200 })
  }

  return NextResponse.json({ workSpace }, { status: 202 })
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]

  const isValidToken = await verifyGithubToken(token)
  if (!isValidToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  const body = await req.json()

  const codingSessionRef = doc(db, 'codingSession', 'currentSession')
  await setDoc(codingSessionRef, body)

  return NextResponse.json(
    {
      message: 'Workspace status fetched successfully.',
    },
    { status: 200 }
  )
}
