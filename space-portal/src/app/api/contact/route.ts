import { NextResponse } from "next/server";
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, message, recipients } = body;

    // Initialize Resend with API key
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    // Send email to each recipient
    await Promise.all(
      recipients.map((recipient: string) =>
        resend.emails.send({
          from: 'Space Portal <onboarding@resend.dev>',
          to: recipient,
          subject: `New Contact Form Submission from ${company}`,
          html: emailContent,
          reply_to: email
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 