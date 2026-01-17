let lastStatus: unknown = null

export async function POST(req: Request) {
  lastStatus = await req.json()
  return new Response(null, { status: 200 })
}

export async function GET() {
  if (!lastStatus) {
    return new Response(null, { status: 204 })
  }

  return Response.json(lastStatus)
}
