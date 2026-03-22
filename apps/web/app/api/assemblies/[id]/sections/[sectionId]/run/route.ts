import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// POST /api/assemblies/:id/sections/:sectionId/run - Run a single section (proxy to NestJS)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, sectionId } = await params;

    // Check if request has body (optional prompt override)
    let body = {};
    try {
      body = await request.json();
    } catch {
      // No body provided, that's OK
    }

    const response = await fetch(`${API_URL}/assemblies/${id}/sections/${sectionId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running section:', error);
    return NextResponse.json({ error: 'Failed to run section' }, { status: 500 });
  }
}
