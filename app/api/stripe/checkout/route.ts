import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Fetch sign details and validate stock
    const signIds = items.map((item: any) => item.sign_id)
    const { data: signs } = await supabase
      .from('signs')
      .select('*')
      .in('id', signIds)
      .is('archived_at', null)

    if (!signs || signs.length !== items.length) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Validate quantities
    for (const item of items) {
      const sign = signs.find((s) => s.id === item.sign_id)
      if (!sign || sign.quantity_available < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${sign?.title || 'item'}` },
          { status: 400 }
        )
      }
    }

    // Create Stripe line items
    const lineItems = items.map((item: any) => {
      const sign = signs.find((s) => s.id === item.sign_id)!
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: sign.title,
            description: sign.description || undefined,
            images: sign.images.slice(0, 1),
          },
          unit_amount: sign.price,
        },
        quantity: item.quantity,
      }
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        user_id: user.id,
        items: JSON.stringify(items),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
