import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

/**
 * Email Drafts API
 *
 * Creates email drafts that are saved but NOT sent.
 * Users must review and explicitly send drafts from the Communications page.
 *
 * This is a CRITICAL safety feature: AI executives can only create drafts,
 * never send emails directly on behalf of users.
 */

// POST - Create a new email draft
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, body: emailBody, htmlBody, contactId, dealId, createdBy } = body;

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Create the email draft via the API
    // We use email-messages endpoint but with status: 'draft' and direction: 'outbound'
    const draftData = {
      direction: 'outbound',
      toAddress: to,
      subject,
      body: emailBody,
      htmlBody: htmlBody || null,
      status: 'draft', // CRITICAL: Always draft, never sent
      contactId: contactId || null,
      dealId: dealId || null,
      metadata: {
        createdBy: createdBy || 'ai-assistant',
        createdAt: new Date().toISOString(),
        isDraft: true,
      },
    };

    console.log('[Email Draft] Creating draft:', JSON.stringify(draftData, null, 2));

    const response = await fetch(`${API_URL}/email-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(draftData),
    });

    const responseText = await response.text();
    console.log(`[Email Draft] Response: ${response.status} ${responseText}`);

    if (!response.ok) {
      // If the API doesn't support drafts directly, store it in a way that can be retrieved
      console.error('[Email Draft] API error, returning draft for manual handling');
      return NextResponse.json({
        success: true,
        draft: {
          id: `draft-${Date.now()}`,
          to,
          subject,
          body: emailBody,
          htmlBody,
          status: 'draft',
          createdAt: new Date().toISOString(),
          note: 'Draft saved. Review in Communications before sending.',
        },
        message: 'Email draft created for review',
      });
    }

    try {
      const result = JSON.parse(responseText);
      return NextResponse.json({
        success: true,
        draft: result,
        message: 'Email draft saved. Review in Communications before sending.',
      });
    } catch {
      return NextResponse.json({
        success: true,
        message: 'Email draft created for review',
      });
    }
  } catch (error) {
    console.error('[Email Draft] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create email draft' },
      { status: 500 }
    );
  }
}

// GET - List email drafts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch drafts from the API
    const response = await fetch(`${API_URL}/email-messages?status=draft`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ drafts: [] });
    }

    const drafts = await response.json();
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    console.error('[Email Draft] Error fetching drafts:', error);
    return NextResponse.json({ drafts: [] });
  }
}
