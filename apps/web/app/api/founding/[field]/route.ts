import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// PATCH /api/founding/:field - Update a single field (vision, mission, values, story)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ field: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { field } = await params;
    const validFields = ['vision', 'mission', 'values', 'story'];

    if (!validFields.includes(field)) {
      return NextResponse.json({ error: `Invalid field: ${field}` }, { status: 400 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/founding/${field}`, {
      method: 'PATCH',
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
    console.error('Error updating founding field:', error);
    return NextResponse.json({ error: 'Failed to update founding field' }, { status: 500 });
  }
}
