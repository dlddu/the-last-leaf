import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: unknown): boolean {
  if (email === null || email === undefined || email === '') {
    return true; // email is optional
  }
  if (typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    const contacts = await prisma.contact.findMany({
      where: { user_id: userId },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!Object.prototype.hasOwnProperty.call(body, 'contacts')) {
      return NextResponse.json(
        { error: 'contacts field is required' },
        { status: 400 }
      );
    }

    const { contacts } = body;

    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { error: 'contacts must be an array' },
        { status: 400 }
      );
    }

    // Validate email format for each contact
    for (const contact of contacts) {
      if (!isValidEmail(contact.email)) {
        return NextResponse.json(
          { error: `Invalid email format: ${contact.email}` },
          { status: 400 }
        );
      }
    }

    // Delete existing contacts for this user
    await prisma.contact.deleteMany({
      where: { user_id: userId },
    });

    // Create new contacts with user_id attached
    const contactsWithUserId = contacts.map(
      (contact: { email?: string | null; phone?: string | null }) => ({
        user_id: userId,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
      })
    );

    await prisma.contact.createMany({
      data: contactsWithUserId,
    });

    return NextResponse.json({ contacts: contactsWithUserId });
  } catch (error) {
    console.error('Update contacts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
