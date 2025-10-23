import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Health check started');
    
    // Test database connection
    const result = await db.select().from(companies).limit(1);
    
    console.log('✅ Database connection successful');
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      companies: result.length
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    const isNetworkError = error instanceof Error && (
      error.message.includes('ENOTFOUND') || 
      error.message.includes('getaddrinfo') ||
      error.message.includes('ECONNREFUSED')
    );
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      isNetworkError,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
