import { WorkspaceStatus } from '@/constants/types'
import { verifyGithubToken } from '@/utils/utils'
import { NextResponse } from 'next/server'

let workspaceStatus: WorkspaceStatus

export async function GET() {
  const currentTime = new Date()
  const lastUpdateTime = new Date(workspaceStatus?.lastUpdate)
  const timeDifference = currentTime.getTime() - lastUpdateTime.getTime()

  if (timeDifference > 300000 || !workspaceStatus) {
    return NextResponse.json({ workSpace: null }, { status: 200 })
  }

  return NextResponse.json(
    {
      workSpace: workspaceStatus,
    },
    { status: 202 }
  )
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

  workspaceStatus = body.status

  return NextResponse.json(
    {
      message: 'Workspace status fetched successfully.',
      data: workspaceStatus,
    },
    { status: 200 }
  )
}
