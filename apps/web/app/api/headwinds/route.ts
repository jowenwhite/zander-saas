import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// GET /api/headwinds - List headwinds (proxy to NestJS)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const queryParams = new URLSearchParams();
    if (priority) queryParams.set('priority', priority);
    if (status) queryParams.set('status', status);
    if (category) queryParams.set('category', category);

    const queryString = queryParams.toString();
    const url = `${API_URL}/headwinds${queryString ? `?${queryString}` : ''}`;

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
    console.error('Error fetching headwinds:', error);
    return NextResponse.json({ error: 'Failed to fetch headwinds' }, { status: 500 });
  }
}

// POST /api/headwinds - Create headwind (proxy to NestJS)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/headwinds`, {
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
    console.error('Error creating headwind:', error);
    return NextResponse.json({ error: 'Failed to create headwind' }, { status: 500 });
  }
}
