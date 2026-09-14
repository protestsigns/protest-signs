import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { getBagTiers, type PricingTier } from '@/lib/pricing'
import { ArrowRight, Star, Shield, Truck, Megaphone } from 'lucide-react'
import { SignCard } from '@/components/sign-card'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Protest Signs — Make Your Voice Heard',
  description:
    'Shop ready-made protest and rally signs online. Plastic bag signs with bundle pricing from $14.99, plus 40+ paper signs on today\'s most important issues. Fast shipping.',
  alternates: { canonical: 'https://protestsigns.com' },
  openGraph: {
    title: 'Protest Signs — Make Your Voice Heard',
    description: 'Ready-made protest signs for every cause. Plastic bag signs, paper signs, bundle pricing. Order online, ship to your door.',
    url: 'https://protestsigns.com',
  },
}

interface SignWithTags {
  id: string
  title: string
  price: number
  images: string[]
  quantity_available: number
  sign_tags: Array<{
    display_order: number
    tag_id: string
  }>
}

interface TagGroup {
  id: string
  name: string
  slug: string
  homepage_order: number
  signs: SignWithTags[]
}

export default async function HomePage() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: popularSigns } = await supabase
    .from('signs')
    .select('*')
    .eq('is_popular', true)
    .is('archived_at', null)
    .gt('quantity_available', 0)
    .order('display_order', { ascending: true })
    .limit(20)

  const { data: seasonalSigns } = await supabase
    .from('signs')
    .select('*')
    .eq('is_seasonal', true)
    .is('archived_at', null)
    .gt('quantity_available', 0)
    .order('display_order', { ascending: true })
    .limit(8)

  const { data: allTiers } = await adminSupabase
    .from('pricing_tiers')
    .select('*')
    .order('display_order', { ascending: true })
  const bagTiers = getBagTiers((allTiers as PricingTier[]) ?? [])

  const { data: homepageTags } = await supabase
    .from('tags')
    .select('*')
    .eq('show_on_homepage', true)
    .order('homepage_order', { ascending: true })

  const tagGroups: TagGroup[] = []
  if (homepageTags) {
    for (const tag of homepageTags) {
      const { data: signTags } = await supabase
        .from('sign_tags')
        .select(`
          display_order,
          tag_id,
          signs (
            id,
            title,
            price,
            images,
            quantity_available,
            archived_at
          )
        `)
        .eq('tag_id', tag.id)
        .order('display_order', { ascending: true })
        .limit(8)

      const signs = signTags
        ?.map((st: any) => ({
          ...st.signs,
          sign_tags: [{ display_order: st.display_order, tag_id: st.tag_id }],
        }))
        .filter((sign: any) => sign.archived_at === null && sign.quantity_available > 0) || []

      if (signs.length > 0) {
        tagGroups.push({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          homepage_order: tag.homepage_order || 0,
          signs,
        })
      }
    }
  }

  // First 8 popular signs used for the Browse All Signs CTA grid
  const ctaSigns = (popularSigns ?? []).slice(0, 8)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://protestsigns.com/#website',
        url: 'https://protestsigns.com',
        name: 'Protest Signs',
        description: 'High-quality protest and rally signs for every cause.',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://protestsigns.com/browse?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://protestsigns.com/#organization',
        name: 'Protest Signs',
        url: 'https://protestsigns.com',
        logo: { '@type': 'ImageObject', url: 'https://protestsigns.com/logo.png' },
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', url: 'https://protestsigns.com/contact' },
      },
      {
        '@type': 'Store',
        '@id': 'https://protestsigns.com/#store',
        name: 'Protest Signs',
        url: 'https://protestsigns.com',
        description: 'Ready-made protest and rally signs — plastic bag signs and paper signs for every cause.',
        image: 'https://protestsigns.com/logo.png',
        priceRange: '$5 - $40',
        paymentAccepted: 'Credit Card',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1 — Photo 1: protest bags in action */}
      <section className="py-10 sm:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <Image
              src="https://igxnbkgaehqlowydrene.supabase.co/storage/v1/object/public/marketing/homepage-photo-1.jpg"
              alt="Protest bag signs ready to carry at a rally"
              width={4032}
              height={3024}
              className="w-full h-auto"
              sizes="(min-width: 896px) 896px, 100vw"
              priority
            />
            <div className="p-5 sm:p-6 text-sm sm:text-base text-gray-700">
              <p className="font-semibold text-black mb-1">Protest bag signs — ready to carry.</p>
              <p>Weatherproof plastic bag signs that slide over a cardboard backing. Lightweight, reusable, and easy to make.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Photo 2: bag being slid over cardboard */}
      <section className="pb-10 sm:pb-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <Image
              src="https://igxnbkgaehqlowydrene.supabase.co/storage/v1/object/public/marketing/homepage-photo-2.jpg"
              alt="Sliding a printed protest sign bag over a cardboard backing"
              width={4032}
              height={3024}
              className="w-full h-auto"
              sizes="(min-width: 896px) 896px, 100vw"
            />
            <div className="p-5 sm:p-6 text-sm sm:text-base text-gray-700">
              <p className="font-semibold text-black mb-1">That easy — slide and staple.</p>
              <p>Cut cardboard to size, attach it to a stick, slide the bag over it, and staple across the bottom. Done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — "Make a Sign" explanation */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-black text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
            BUNDLE &amp; SAVE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Make a Sign</h2>
          <p className="text-gray-600 mb-3">
            If you can cut a piece of cardboard to size and attach it (staple, glue, or tape)
            to a stick, the only thing left to make a sign is sliding a bag over the
            cardboard for a quick, easy, inexpensive sign. A few staples across the bottom,
            pulling things tight, and you&apos;re done.
          </p>
          <p className="text-gray-600">
            Cut your cardboard about an inch smaller than the bag in each direction —{' '}
            <strong>28&quot; × 23&quot;</strong> for the bag signs, or{' '}
            <strong>23&quot; × 23&quot;</strong> for the peace sign.
          </p>
        </div>
      </section>

      {/* 5 — Popular Plastic Bag Signs */}
      {popularSigns && popularSigns.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <div className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                  BEST SELLERS
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-3">Popular Plastic Bag Signs</h2>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Reusable plastic bag signs — weatherproof and ready to carry. Each image shows both sides.
                </p>
              </div>
              <Link
                href="/browse?type=bag"
                className="hidden md:flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
              >
                View All
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularSigns.map((sign, index) => (
                <SignCard
                  key={sign.id}
                  sign={sign}
                  index={index}
                  priceLabel={null}
                  dualSizes="(max-width: 640px) calc(50vw - 1rem), (max-width: 1024px) calc(25vw - 1rem), (max-width: 1280px) calc(16vw - 1rem), 12vw"
                  singleSizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 2rem), (max-width: 1280px) calc(33vw - 2rem), 25vw"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6 — Photo 3: white paper vs plain cardboard comparison */}
      <section className="py-12 bg-gray-50 border-t border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <Image
              src="https://igxnbkgaehqlowydrene.supabase.co/storage/v1/object/public/marketing/homepage-photo-3.jpg"
              alt="Side-by-side comparison: sign with white paper backing versus plain cardboard showing through"
              width={4032}
              height={3024}
              className="w-full h-auto"
              sizes="(min-width: 768px) 896px, 100vw"
            />
            <div className="p-5 sm:p-6 text-sm sm:text-base text-gray-700">
              <p>
                The ink on the bags is not indestructible and can be scratched. When
                you&apos;re storing the bags it&apos;s best not to pile things on top of the sign.
                If your cardboard has printing on it, we suggest covering it with white
                paper first so the text doesn&apos;t show through the bag. Otherwise, it&apos;s
                up to you — plain cardboard works just fine but you can see the color
                difference in the above photo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Pricing table + video placeholder */}
      {bagTiers.length > 0 && (
        <section className="py-16 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                <table className="w-full text-sm sm:text-base">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-6 py-3 text-left font-semibold">Quantity</th>
                      <th className="px-6 py-3 text-right font-semibold">Price (shipping included)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bagTiers.map((tier, i) => (
                      <tr key={tier.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-gray-800">{tier.label}</td>
                        <td className="px-6 py-4 text-right font-bold text-black">
                          {formatPrice(tier.price)}
                          {tier.max_qty === null && tier.overflow_unit_price != null && (
                            <span className="text-gray-500 font-normal text-sm"> + {formatPrice(tier.overflow_unit_price)}/bag</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-amber-50 border-t border-amber-200 p-5 text-sm text-amber-900 mt-auto">
                  <p className="font-semibold mb-1">Want the same message on both sides — or something different?</p>
                  <p>Just buy two bags and staple the side of the second bag you want showing outward. It&apos;s that easy.</p>
                </div>
              </div>

              {/* How to Make a Sign video */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/xYfBKdR5Lgg"
                    title="How to Make a Sign"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-white text-lg font-bold px-6 pt-4 text-center">How to Make a Sign</p>
                <p className="text-gray-400 text-sm px-6 pb-6 pt-1 text-center">See how quick and easy it is to put together a bag sign from start to finish.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8 — Browse All Signs CTA (signs grid with overlaid buttons) */}
      {ctaSigns.length > 0 && (
        <section className="py-16 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden">
              {/* Sign grid background */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 opacity-80">
                {ctaSigns.map((sign) => (
                  <div key={sign.id} className="relative aspect-square bg-white">
                    {sign.images?.[0] && (
                      <Image
                        src={sign.images[0]}
                        alt={sign.title}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 px-4">
                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
                  Shop All Signs
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:justify-center">
                  <Link href="/browse">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                      Browse All Signs
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="#categories">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                      View Categories
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9 — T-Shirts: Coming Soon */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-gray-200 text-gray-700 text-sm font-bold px-3 py-1 rounded-full mb-3">
              COMING SOON
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">T-Shirts</h2>
            <p className="text-gray-600">Bold messages you can wear. Available soon.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-md">
              <Image
                src="https://igxnbkgaehqlowydrene.supabase.co/storage/v1/object/public/marketing/shirt-1-front.jpg"
                alt="Protest T-Shirt — coming soon"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 45vw, 280px"
              />
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-md">
              <Image
                src="https://igxnbkgaehqlowydrene.supabase.co/storage/v1/object/public/marketing/shirt-2-front.jpg"
                alt="Protest T-Shirt — coming soon"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 45vw, 280px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 10 & 11 — Plant Pals + Cloth Bag Signs: Coming Soon */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
              <div className="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                COMING SOON
              </div>
              <h3 className="text-2xl font-bold mb-2">Plant Pals — Mini Signs</h3>
              <p className="text-gray-500 text-sm">Small signs made for your garden, porch, or planter. Same bold messages, mini size — put them anywhere you want to make your voice heard.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
              <div className="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                COMING SOON
              </div>
              <h3 className="text-2xl font-bold mb-2">Cloth Bag Signs</h3>
              <p className="text-gray-500 text-sm">Durable, reusable cloth bag signs — longer lasting and washable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — Seasonal/Featured Signs */}
      {seasonalSigns && seasonalSigns.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <div className="inline-block bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                  TRENDING NOW
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-3">Featured Collection</h2>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Timely designs for current movements, events, and causes that matter today
                </p>
              </div>
              <Link
                href="/browse?featured=seasonal"
                className="hidden md:flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
              >
                View All
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {seasonalSigns.slice(0, 4).map((sign, index) => (
                <SignCard
                  key={sign.id}
                  sign={sign}
                  index={index}
                  priceLabel={formatPrice(sign.price)}
                  singleSizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 4rem), calc(25vw - 2rem)"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 13 — Categories */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect sign for your cause
            </p>
          </div>

          {tagGroups.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
              <p className="text-gray-600 mb-8">We&apos;re adding signs to our collection. Check back soon!</p>
              <Link href="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-20">
              {tagGroups.map((group) => (
                <div key={group.id}>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{group.name}</h3>
                      <p className="text-gray-600">Powerful messages for {group.name.toLowerCase()}</p>
                    </div>
                    <Link
                      href={`/browse?tag=${group.slug}`}
                      className="flex items-center gap-2 text-black hover:gap-3 transition-all font-semibold group"
                    >
                      View All
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.signs.slice(0, 4).map((sign, index) => (
                      <SignCard
                        key={sign.id}
                        sign={{ ...sign, product_type: null }}
                        index={index}
                        priceLabel={formatPrice(sign.price)}
                        singleSizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 4rem), calc(25vw - 2rem)"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 14 — Premium Quality / Fast Shipping / Weather Resistance */}
      <section className="py-16 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Professional printing on durable materials that last</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
                <p className="text-gray-600">Quick turnaround to get your message out there fast</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Weather Resistant</h3>
                <p className="text-gray-600">Built to withstand outdoor conditions and last</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 15 — Our Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-4">
            Our long-term mission is to get the economy working for everyone — by making living-wage job creation self-funding and creating new revenue streams for our communities.
          </p>
          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            We believe everyone deserves the right to speak out. No design skills needed — just pick a message, order it, and show up ready to be heard.
          </p>
          <Link href="/about">
            <Button variant="outline" size="lg">Read Our Full Story</Button>
          </Link>
        </div>
      </section>

      {/* 16 — CTA footer */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Get in touch with us and we&apos;ll help you create the perfect sign for your cause.
            Custom designs available.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6">
              Contact Support
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
