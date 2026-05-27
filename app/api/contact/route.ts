import { NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, schoolName, email, phone, message } = body;

    if (!fullName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save submission to database
    const newMessage = await prisma.contactMessage.create({
      data: {
        fullName,
        schoolName: schoolName || null,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error: any) {
    console.error('[ContactAPI] Error handling contact form submission:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

