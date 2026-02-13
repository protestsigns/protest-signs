'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { slugify } from '@/lib/utils'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Tag {
  id: string
  name: string
  slug: string
}

export default function NewSignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [sizes, setSizes] = useState('12x18, 18x24, 24x36')
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<{ [key: string]: number }>({})

  const supabase = createClient()

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*').order('name')
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const priceInCents = Math.round(parseFloat(price) * 100)

    // Insert sign
    const { data: sign, error } = await supabase
      .from('signs')
      .insert({
        title,
        description: description || null,
        price: priceInCents,
        quantity_available: parseInt(quantity),
        images,
        sizes: sizes || null,
      })
      .select()
      .single()

    if (error) {
      alert(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    // Insert sign_tags
    const signTags = Object.entries(selectedTags).map(([tagId, displayOrder]) => ({
      sign_id: sign.id,
      tag_id: tagId,
      display_order: displayOrder,
    }))

    if (signTags.length > 0) {
      await supabase.from('sign_tags').insert(signTags)
    }

    router.push('/admin/signs')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/admin/signs">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signs
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Sign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Sign title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sign description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity *</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sizes</label>
              <Input
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="12x18, 18x24, 24x36"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Images</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL"
                />
                <Button type="button" onClick={handleAddImage} variant="outline">
                  Add
                </Button>
              </div>
              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{url}</span>
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        variant="ghost"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={!!selectedTags[tag.id]}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags({ ...selectedTags, [tag.id]: 0 })
                        } else {
                          const newTags = { ...selectedTags }
                          delete newTags[tag.id]
                          setSelectedTags(newTags)
                        }
                      }}
                      className="rounded"
                    />
                    <span className="flex-1">{tag.name}</span>
                    {selectedTags[tag.id] !== undefined && (
                      <Input
                        type="number"
                        value={selectedTags[tag.id]}
                        onChange={(e) =>
                          setSelectedTags({
                            ...selectedTags,
                            [tag.id]: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Display order"
                        className="w-32"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sign'
                )}
              </Button>
              <Link href="/admin/signs">
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
