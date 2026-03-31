import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// GET /api/hq-goals - List HQ goals (proxy to NestJS)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const status = searchParams.get('status');
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    const priority = searchParams.get('priority');

    const queryParams = new URLSearchParams();
    if (scope) queryParams.set('scope', scope);
    if (status) queryParams.set('status', status);
    if (quarter) queryParams.set('quarter', quarter);
    if (year) queryParams.set('year', year);
    if (priority) queryParams.set('priority', priority);

    const queryString = queryParams.toString();
    const url = `${API_URL}/hq-goals${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching HQ goals:', error);
    return NextResponse.json({ error: 'Failed to fetch HQ goals' }, { status: 500 });
  }
}

// POST /api/hq-goals - Create HQ goal (proxy to NestJS)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/hq-goals`, {
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
    console.error('Error creating HQ goal:', error);
    return NextResponse.json({ error: 'Failed to create HQ goal' }, { status: 500 });
  }
}
