'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
}

interface Sign {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
}

function BrowsePageContent() {
  const searchParams = useSearchParams()
  const [signs, setSigns] = useState<Sign[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  const supabase = createClient()

  useEffect(() => {
    // Get pre-selected tags from URL
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setSelectedTags([tagParam])
    }
  }, [searchParams])

  useEffect(() => {
    // Fetch all tags
    const fetchTags = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, slug')
        .order('name')
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  useEffect(() => {
    // Fetch signs based on filters
    const fetchSigns = async () => {
      setLoading(true)
      let query = supabase
        .from('signs')
        .select('*')
        .is('archived_at', null)
        .gt('quantity_available', 0)

      // Apply sorting
      if (sortBy === 'price-asc') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'price-desc') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data: allSigns } = await query

      // Filter by tags (OR logic)
      if (selectedTags.length > 0 && allSigns) {
        const { data: signTags } = await supabase
          .from('sign_tags')
          .select('sign_id, tags(slug)')
          .in(
            'tag_id',
            tags
              .filter((t) => selectedTags.includes(t.slug))
              .map((t) => t.id)
          )

        const signIdsWithTags = new Set(signTags?.map((st) => st.sign_id) || [])
        const filteredSigns = allSigns.filter((sign) => signIdsWithTags.has(sign.id))
        setSigns(filteredSigns)
      } else {
        setSigns(allSigns || [])
      }

      setLoading(false)
    }

    if (tags.length > 0 || selectedTags.length === 0) {
      fetchSigns()
    }
  }, [selectedTags, sortBy, tags])

  const toggleTag = (slug: string) => {
    if (selectedTags.includes(slug)) {
      setSelectedTags(selectedTags.filter((t) => t !== slug))
    } else {
      setSelectedTags([...selectedTags, slug])
    }
  }

  const clearFilters = () => {
    setSelectedTags([])
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Browse Signs</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.slug)}
                          onChange={() => toggleTag(tag.slug)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Signs Grid */}
          <div className="flex-1">
            {selectedTags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedTags.map((slug) => {
                  const tag = tags.find((t) => t.slug === slug)
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 bg-black text-white px-3 py-1 rounded-full text-sm"
                    >
                      {tag?.name}
                      <button
                        onClick={() => toggleTag(slug)}
                        className="hover:bg-gray-800 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading signs...</p>
              </div>
            ) : signs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-2">No signs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or check back later
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Showing {signs.length} {signs.length === 1 ? 'sign' : 'signs'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {signs.map((sign) => (
                    <Link
                      key={sign.id}
                      href={`/sign/${sign.id}`}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                        {sign.images.length > 0 ? (
                          <Image
                            src={sign.images[0]}
                            alt={sign.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        {sign.quantity_available <= 5 && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                            Only {sign.quantity_available} left
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:underline">
                        {sign.title}
                      </h3>
                      <p className="text-gray-600">{formatPrice(sign.price)}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-8">Browse Signs</h1>
          <div className="text-center py-12">
            <p className="text-gray-600">Loading signs...</p>
          </div>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  )
}
