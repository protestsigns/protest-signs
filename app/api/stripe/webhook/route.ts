import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any

    const userId = session.metadata.user_id ?? null
    const items = JSON.parse(session.metadata.items)

    // Create order (user_id is null for guest checkouts)
    const { data: order } = await supabase
      .from('orders')
      .insert({
        ...(userId ? { user_id: userId } : {}),
        stripe_session_id: session.id,
        status: 'completed',
        total: session.amount_total,
        customer_email: session.customer_details?.email ?? null,
      })
      .select()
      .single()

    if (order) {
      // Create order items and update inventory
      for (const item of items) {
        const { data: sign } = await supabase
          .from('signs')
          .select('price, quantity_available')
          .eq('id', item.sign_id)
          .single()

        if (sign) {
          // Insert order item
          await supabase.from('order_items').insert({
            order_id: order.id,
            sign_id: item.sign_id,
            quantity: item.quantity,
            price_at_purchase: sign.price,
          })

          // Update inventory
          await supabase
            .from('signs')
            .update({
              quantity_available: Math.max(0, sign.quantity_available - item.quantity),
            })
            .eq('id', item.sign_id)
        }
      }

      // Clear logged-in user's cart (guest carts are cleared client-side on success page)
      if (userId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .in(
            'sign_id',
            items.map((i: any) => i.sign_id)
          )
      }
    }
  }

  return NextResponse.json({ received: true })
}
