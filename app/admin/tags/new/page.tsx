'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function NewTagPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [showOnHomepage, setShowOnHomepage] = useState(false)
  const [homepageOrder, setHomepageOrder] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(slugify(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('tags').insert({
      name,
      slug,
      show_on_homepage: showOnHomepage,
      homepage_order: showOnHomepage && homepageOrder ? parseInt(homepageOrder) : null,
    })

    if (error) {
      alert(`Error: ${error.message}`)
      setLoading(false)
    } else {
      router.push('/admin/tags')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/admin/tags">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tags
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="Popular"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="popular"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnHomepage}
                onChange={(e) => setShowOnHomepage(e.target.checked)}
                className="rounded"
              />
              <label className="text-sm font-medium">Show on Homepage</label>
            </div>

            {showOnHomepage && (
              <div>
                <label className="block text-sm font-medium mb-2">Homepage Order</label>
                <Input
                  type="number"
                  value={homepageOrder}
                  onChange={(e) => setHomepageOrder(e.target.value)}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Tag'
                )}
              </Button>
              <Link href="/admin/tags">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
