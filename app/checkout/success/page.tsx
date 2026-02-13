'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate a brief loading state
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be
          processed shortly.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Session ID: {searchParams.get('session_id')}
        </p>
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
