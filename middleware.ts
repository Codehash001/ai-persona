import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { initializeCronJobs } from './lib/init-cron'
 
export async function middleware(request: NextRequest) {
    // Initialize cron jobs
    await initializeCronJobs();
    
    // Continue with the request
    return NextResponse.next()
}
 
export const config = {
    // Only run the middleware for API routes
    matcher: '/api/:path*',
}
