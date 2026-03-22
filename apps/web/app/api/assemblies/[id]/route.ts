import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { AssemblyCadence, AssemblyStatus } from '@prisma/client';

// GET /api/assemblies/:id - Get assembly with sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const assembly = await prisma.assembly.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
    }

    return NextResponse.json({ assembly });
  } catch (error) {
    console.error('Error fetching assembly:', error);
    return NextResponse.json({ error: 'Failed to fetch assembly' }, { status: 500 });
  }
}

// PATCH /api/assemblies/:id - Update assembly
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, cadence, scheduledFor, status } = body;

    // Verify ownership
    const existing = await prisma.assembly.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (cadence !== undefined) updateData.cadence = cadence as AssemblyCadence;
    if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (status !== undefined) updateData.status = status as AssemblyStatus;

    const assembly = await prisma.assembly.update({
      where: { id },
      data: updateData,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ assembly });
  } catch (error) {
    console.error('Error updating assembly:', error);
    return NextResponse.json({ error: 'Failed to update assembly' }, { status: 500 });
  }
}

// DELETE /api/assemblies/:id - Archive assembly
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.assembly.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
    }

    // Soft delete - set status to ARCHIVED
    await prisma.assembly.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving assembly:', error);
    return NextResponse.json({ error: 'Failed to archive assembly' }, { status: 500 });
  }
}
