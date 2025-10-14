import { NextResponse } from 'next/server';
import { sendContactFormEmail } from '../../utils/email';

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const { firstName, lastName, email, phone, message } = formData;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    // Define admin email (replace with your actual admin email or environment variable)
    const adminEmail = process.env.ADMIN_EMAIL || 'noreply@beauty-lounge.com'; // Placeholder, replace with actual admin email

    await sendContactFormEmail(email, adminEmail, formData);

    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    return NextResponse.json({ message: 'Failed to send message.' }, { status: 500 });
  }
}
