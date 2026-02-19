import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler } from '@/lib/api-helpers';
import { isValidEmail } from '@/lib/validation';

export const GET = withErrorHandler('Get contacts error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const contacts = await prisma.contact.findMany({
    where: { user_id: auth.userId },
  });

  return NextResponse.json({ contacts });
});

export const PUT = withErrorHandler('Update contacts error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const body = await parseJsonBody<{ contacts?: unknown }>(request);
  if (!body.success) return body.response;

  if (!Object.prototype.hasOwnProperty.call(body.data, 'contacts')) {
    return NextResponse.json(
      { error: 'contacts field is required' },
      { status: 400 }
    );
  }

  const { contacts } = body.data;

  if (!Array.isArray(contacts)) {
    return NextResponse.json(
      { error: 'contacts must be an array' },
      { status: 400 }
    );
  }

  for (const contact of contacts) {
    if (!isValidEmail(contact.email)) {
      return NextResponse.json(
        { error: `Invalid email format: ${contact.email}` },
        { status: 400 }
      );
    }
  }

  await prisma.contact.deleteMany({
    where: { user_id: auth.userId },
  });

  const contactsWithUserId = contacts.map(
    (contact: { email?: string | null; phone?: string | null }) => ({
      user_id: auth.userId,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
    })
  );

  await prisma.contact.createMany({
    data: contactsWithUserId,
  });

  return NextResponse.json({ contacts: contactsWithUserId });
});
