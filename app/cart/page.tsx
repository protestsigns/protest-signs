'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { computeBagPrice, getPaperShipping, getPaperUnitPrice, type PricingTier } from '@/lib/pricing'
import {
  getGuestCart,
  updateGuestCartQty,
  removeFromGuestCart,
  mergeGuestCartToSupabase,
  type GuestCartItem,
} from '@/lib/guest-cart'

interface SignData {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
  product_type: string | null
}

interface CartItem {
  id: string
  quantity: number
  signs: SignData
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tiers, setTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const res = await fetch('/api/pricing')
      const data = await res.json()
      setTiers(data.tiers ?? [])

      if (user) {
        // Merge any guest cart items then fetch from Supabase
        await mergeGuestCartToSupabase(supabase, user.id)
        await fetchSupabaseCart(user.id)
      } else {
        await fetchGuestCart()
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchSupabaseCart = async (userId: string) => {
    const { data } = await supabase
      .from('cart_items')
      .select('id, quantity, signs (id, title, price, images, quantity_available, product_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setCartItems((data as any) || [])
    setLoading(false)
  }

  const fetchGuestCart = async () => {
    const guestItems: GuestCartItem[] = getGuestCart()
    if (guestItems.length === 0) {
      setCartItems([])
      setLoading(false)
      return
    }

    const signIds = guestItems.map((i) => i.sign_id)
    const { data: signs } = await supabase
      .from('signs')
      .select('id, title, price, images, quantity_available, product_type')
      .in('id', signIds)
      .is('archived_at', null)

    const items: CartItem[] = guestItems
      .map((gi) => {
        const sign = signs?.find((s) => s.id === gi.sign_id)
        if (!sign) return null
        return {
          id: gi.sign_id,
          quantity: gi.quantity,
          signs: sign as SignData,
        }
      })
      .filter(Boolean) as CartItem[]

    setCartItems(items)
    setLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (user) {
      if (newQuantity <= 0) {
        await supabase.from('cart_items').delete().eq('id', itemId)
      } else {
        await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId)
      }
      await fetchSupabaseCart(user.id)
    } else {
      // itemId is sign_id for guests
      updateGuestCartQty(itemId, newQuantity)
      await fetchGuestCart()
    }
  }

  const removeItem = async (itemId: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', itemId)
      await fetchSupabaseCart(user.id)
    } else {
      removeFromGuestCart(itemId)
      await fetchGuestCart()
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    const items = cartItems.map((item) => ({
      sign_id: item.signs.id,
      quantity: item.quantity,
    }))
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const { url, error } = await response.json()
    if (error) { alert(error); setCheckingOut(false) }
    else if (url) window.location.href = url
  }

  // Pricing calculations
  const bagItems = cartItems.filter((i) => i.signs.product_type === 'bag')
  const paperItems = cartItems.filter((i) => i.signs.product_type !== 'bag')

  const totalBagQty = bagItems.reduce((sum, i) => sum + i.quantity, 0)
  const bagBundlePrice = tiers.length > 0
    ? computeBagPrice(totalBagQty, tiers)
    : bagItems.reduce((s, i) => s + i.signs.price * i.quantity, 0)

  const paperUnitPrice = getPaperUnitPrice(tiers)
  const paperShipping = getPaperShipping(tiers)
  const totalPaperQty = paperItems.reduce((sum, i) => sum + i.quantity, 0)
  const paperSubtotal = totalPaperQty * paperUnitPrice
  const paperShippingCharge = paperItems.length > 0 ? paperShipping : 0
  const grandTotal = (totalBagQty > 0 ? bagBundlePrice : 0) + paperSubtotal + paperShippingCharge

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some signs to get started</p>
          <Link href="/browse"><Button>Browse Signs</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
        {!user && (
          <p className="text-sm text-gray-500 mb-6">
            Checking out as guest.{' '}
            <Link href="/auth/login" className="underline hover:text-black">
              Sign in
            </Link>{' '}
            to save your cart.
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {bagItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-700">Bag Signs</h2>
                  <span className="text-sm text-gray-500">
                    {totalBagQty} bag{totalBagQty !== 1 ? 's' : ''} — bundle price:{' '}
                    <strong>{formatPrice(bagBundlePrice)}</strong> (shipping included)
                  </span>
                </div>
                {bagItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    itemKey={user ? item.id : item.signs.id}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                    priceDisplay={null}
                  />
                ))}
              </div>
            )}

            {paperItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-700">Paper Signs</h2>
                  <span className="text-sm text-gray-500">
                    {totalPaperQty} sign{totalPaperQty !== 1 ? 's' : ''} × {formatPrice(paperUnitPrice)} +{' '}
                    {formatPrice(paperShipping)} shipping
                  </span>
                </div>
                {paperItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    itemKey={user ? item.id : item.signs.id}
                    onUpdate={updateQuantity}
                    onRemove={removeItem}
                    priceDisplay={formatPrice(paperUnitPrice * item.quantity)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 text-sm">
                {totalBagQty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bag signs ({totalBagQty} — bundle)</span>
                    <span>{formatPrice(bagBundlePrice)}</span>
                  </div>
                )}
                {paperItems.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paper signs ({totalPaperQty})</span>
                      <span>{formatPrice(paperSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paper sign shipping</span>
                      <span>{formatPrice(paperShippingCharge)}</span>
                    </div>
                  </>
                )}
                {totalBagQty > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Bag sign shipping</span>
                    <span>Included</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Tax calculated at checkout</p>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.some((item) => item.quantity > item.signs.quantity_available)}
                size="lg"
                className="w-full"
              >
                {checkingOut
                  ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Processing...</>
                  : user ? 'Proceed to Checkout' : 'Checkout as Guest'}
              </Button>

              {!user && (
                <Link href={`/auth/login?next=/cart`}>
                  <Button variant="outline" className="w-full mt-3">
                    Sign in to checkout
                  </Button>
                </Link>
              )}

              <Link href="/browse">
                <Button variant="ghost" className="w-full mt-3">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartItemRow({
  item,
  itemKey,
  onUpdate,
  onRemove,
  priceDisplay,
}: {
  item: CartItem
  itemKey: string
  onUpdate: (key: string, qty: number) => void
  onRemove: (key: string) => void
  priceDisplay: string | null
}) {
  return (
    <div className="bg-white rounded-lg p-6 flex gap-6 mb-3">
      <Link
        href={`/sign/${item.signs.id}`}
        className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
      >
        {item.signs.images.length > 0 ? (
          <Image
            src={item.signs.images[0]}
            alt={item.signs.title}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
      </Link>

      <div className="flex-1">
        <Link href={`/sign/${item.signs.id}`} className="font-semibold hover:underline">
          {item.signs.title}
        </Link>

        {item.quantity > item.signs.quantity_available && (
          <p className="text-red-600 text-sm mt-1">
            Only {item.signs.quantity_available} available
          </p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => onUpdate(itemKey, item.quantity - 1)}
              className="px-3 py-1 hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdate(itemKey, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-center border-x border-gray-300 py-1 text-sm"
              min="1"
              max={item.signs.quantity_available}
            />
            <button
              onClick={() => onUpdate(itemKey, item.quantity + 1)}
              disabled={item.quantity >= item.signs.quantity_available}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemove(itemKey)}
            className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
          >
            <Trash2 className="w-4 h-4" />Remove
          </button>
        </div>
      </div>

      {priceDisplay && (
        <div className="text-right font-semibold">{priceDisplay}</div>
      )}
    </div>
  )
}
