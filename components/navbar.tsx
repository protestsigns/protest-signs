'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, LogOut, User, Menu, X } from 'lucide-react'
import { getGuestCartCount } from '@/lib/guest-cart'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile:', error.message)
              setIsAdmin(false)
            } else {
              setIsAdmin(data?.is_admin || false)
            }
          })

        supabase
          .from('cart_items')
          .select('quantity', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching cart:', error.message)
              setCartCount(0)
            } else {
              const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
              setCartCount(total)
            }
          })
      } else {
        setCartCount(getGuestCartCount())
      }
    })

    const refreshGuestCount = () => setCartCount(getGuestCartCount())
    window.addEventListener('guest-cart-update', refreshGuestCount)

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        () => {
          if (user) {
            supabase
              .from('cart_items')
              .select('quantity')
              .eq('user_id', user.id)
              .then(({ data }) => {
                const total = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
                setCartCount(total)
              })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('guest-cart-update', refreshGuestCount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Close menu when navigating
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/donate', label: 'Donate' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + desktop nav links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/logo.png"
                  alt="Protest Signs"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    link.href === '/admin'
                      ? pathname.startsWith('/admin')
                      : pathname === link.href
                    ? 'text-black'
                    : 'text-gray-600'
                  } hover:text-black transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: cart, account, hamburger */}
          <div className="flex items-center space-x-2">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/account">
                  <Button variant="ghost" size="sm" title="Account settings">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign out" className="hidden sm:inline-flex">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="hidden sm:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  (link.href === '/admin' ? pathname.startsWith('/admin') : pathname === link.href)
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Auth links in mobile menu */}
            <div className="border-t pt-3 mt-3 space-y-1">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="block px-3 py-3 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
