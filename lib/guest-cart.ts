export type GuestCartItem = { sign_id: string; quantity: number }

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('guest_cart') || '[]')
  } catch {
    return []
  }
}

export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('guest_cart', JSON.stringify(items))
}

export function addToGuestCart(sign_id: string, qty: number): void {
  const cart = getGuestCart()
  const existing = cart.find((i) => i.sign_id === sign_id)
  if (existing) {
    existing.quantity += qty
  } else {
    cart.push({ sign_id, quantity: qty })
  }
  saveGuestCart(cart)
}

export function updateGuestCartQty(sign_id: string, qty: number): void {
  if (qty <= 0) {
    removeFromGuestCart(sign_id)
    return
  }
  const cart = getGuestCart()
  const item = cart.find((i) => i.sign_id === sign_id)
  if (item) item.quantity = qty
  saveGuestCart(cart)
}

export function removeFromGuestCart(sign_id: string): void {
  saveGuestCart(getGuestCart().filter((i) => i.sign_id !== sign_id))
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, i) => sum + i.quantity, 0)
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('guest_cart')
}

// Called after login to merge localStorage cart into the user's Supabase cart
export async function mergeGuestCartToSupabase(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  userId: string
): Promise<void> {
  const guestItems = getGuestCart()
  if (guestItems.length === 0) return

  await Promise.all(
    guestItems.map(async ({ sign_id, quantity }) => {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('sign_id', sign_id)
        .single()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({ user_id: userId, sign_id, quantity })
      }
    })
  )

  clearGuestCart()
}
