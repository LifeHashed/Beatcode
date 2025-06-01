import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({ message: 'Admin API endpoint' })
  } catch (error) {
    console.error('Error in admin API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
