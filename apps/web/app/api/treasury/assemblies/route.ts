import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// GET /api/treasury/assemblies - List assembly templates (proxy to NestJS)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const executive = searchParams.get('executive');
    const industry = searchParams.get('industry');

    const queryParams = new URLSearchParams();
    if (category) queryParams.set('category', category);
    if (executive) queryParams.set('executive', executive);
    if (industry) queryParams.set('industry', industry);

    const queryString = queryParams.toString();
    const url = `${API_URL}/treasury/assemblies${queryString ? `?${queryString}` : ''}`;

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
    console.error('Error fetching assembly templates:', error);
    return NextResponse.json({ error: 'Failed to fetch assembly templates' }, { status: 500 });
  }
}
