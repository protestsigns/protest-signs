import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { wrapEmail } from '@/lib/email-template'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { name, email, message, website } = await request.json()

    // Honeypot field — real visitors never fill this in. Bots that do get a
    // fake success response so they don't know they were blocked.
    if (website) {
      return NextResponse.json({ success: true })
    }

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Store in database
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        message,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    const fromAddress = `Protest Signs <${process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'}>`
    const safeMessage = message.replace(/\n/g, '<br>')

    // Notify the site owner
    try {
      await resend.emails.send({
        from: fromAddress,
        to: process.env.CONTACT_EMAIL || 'sustainamericallc@gmail.com',
        replyTo: email,
        subject: `New Contact Form: ${name}`,
        html: wrapEmail(
          'New Contact Form Submission',
          `
            <h2 style="margin-top:0;">New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
          `
        ),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
      // Message is still saved in database
    }

    // Confirm receipt with the person who submitted the form
    try {
      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `We received your message — Protest Signs`,
        html: wrapEmail(
          'Thanks for reaching out',
          `
            <h2 style="margin-top:0;">Thanks for reaching out, ${name}!</h2>
            <p>We received your message and will get back to you soon.</p>
            <p style="color:#555;"><strong>Your message:</strong><br>${safeMessage}</p>
          `
        ),
      })
    } catch (emailError) {
      console.error('Confirmation email error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
